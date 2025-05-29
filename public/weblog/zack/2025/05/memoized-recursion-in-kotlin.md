---
title: "Memoized Recursion in Kotlin"
date: "2025-05-29"
lead: "Who knew it would be this hard?"
shortname: "kotlinmemoize"
---

Last night I was studying up on dynamic programming interview questions and got pulled into an interesting distraction - how to memoize recursive functions. In Python, this is easy, you just slap `@functools.cache` on the function and you're done. But I'm doing all my practice in Kotlin so I went looking for a solution in that language and found it surprisingly difficult. Ultimately, I spent a few hours understanding Y Combinators and someone else's solution and came up with this interface:

```kotlin
val fibonacci = memoizedRecursion<Int, Int> { n ->
	if (n == 0 || n == 1) 1 else recur(n-1) * recur(n-2)
}
```

Now, I can quickly hear you call foul on this - where does this `recur` function magically come from? Kotlin has a few tricks up its sleeve, in this case we're using a function with a receiver. The receiver becomes `this`, and `recur` is a method on the receiver type. If you've used the `apply` scope function before, you've taken advantage of this shorthand already. Here's the receiver type and function signature:

```kotlin
interface Recurable<TIn, TOut> {
	fun recur(arg: TIn): TOut
}

fun <TIn, TOut> memoizedRecursion(
	func: (Recurable<TIn, TOut>).(TIn) -> TOut
): (TIn) -> TOut
```

Since the lambda passed to `memoizedRecursion` is typed to be `Recurable`, it can reference `this.recur`, or simply `recur`. But this doesn't tell us how we implement `memoizedRecursion`, nor how to make an instance of `Recurable`.

Let's solve a simpler problem first - the Y Combinator, which is a function that passes a function to itself. Another way of looking at this is making `memoizedRecursion` without the memoization, since then we give a function access to itself via the `recur` method.

```kotlin
class Recursion<TIn, TOut>(
	private val func: (Recurable<TIn, TOut>).(TIn) -> TOut
) : Recurable<TIn, TOut> {
	override fun recur(arg: TIn) = func(arg)
}

fun <TIn, TOut> makeRecursion(
	func: (Recurable<TIn, TOut>).(TIn) -> TOut
): (TIn) -> TOut = Recursion(func)::recur
```

We are deep into Kotlin shorthand now - all our methods are defined with = instead of curly braces and returns, but you can think of these as one-liners reduced to actually one line.

The `Recursion` type takes our lambda and stores it as `func`, then defines `recur` as simply calling `func`. I must stress this is _almost identical_ to just being a function literal, with the one caveat that the function has a working `Recurable` receiver, which means it can call `recur`.

The `makeRecursion` function just hides the work - making our recursive lambda appear like a simple `(TIn) -> TOut` by returning a bound `recur`. We can use it like this:

```kotlin
val factorial = makeRecurison<Int, Int> { n ->
	if (n == 0) 1 else n * recur(n-1)
}
```

Now that we have some experience torturing function receivers into giving us our function back as `recur`, adding memoization is actually pretty easy. We simply redefine `recur` to first check our result `cache` and return the value stored there if there is any. Otherwise, we call the function as usual and put the result in the cache before returning it. Kotlin provides a very nice `getOrPut` method on `MutableMap` that does exactly this for us. Here's the full implementation:

```kotlin
class MemoizedRecursion<TIn, TOut>(
    private val func: (Recurable<TIn, TOut>).(TIn) -> TOut
) : Recurable<TIn, TOut> {
    val cache = mutableMapOf<TIn, TOut>()
    override fun recur(arg: TIn) = cache.getOrPut(arg) { func(arg) }
}

fun <TIn, TOut> memoizedRecursion(
    func: (Recurable<TIn, TOut>).(TIn) -> TOut
): (TIn) -> TOut = MemoizedRecursion(func)::recur
```

A few things to note before I go further:

- This is not production-worthy code. Go use ArrowKT's `MemoizedDeepRecursiveFunction`, which I discovered after figuring this out myself.
- This approach can be extended to multiple input arguments but ultimately you're still making a `Pair` or `Triple`, etc of the input arguments to use as a cache key so it is of limited usefulness.
- Usual disclaimers about pure functions and immutable inputs and outputs apply. Violate at your own peril.

Some reflections - Being the code golfer that I am, I really wanted to do this without having to define `Recurable` - if the Y Combinator passes a function to itself, surely I can write that more directly, right? It's just a second argument!

Unfortunately, a problem arises when you try to type that method signature - it's infinitely recursive! Kotlin also prohibits recursive `typealias`es, so you can't cheat that way either. Ultimately, I had to accept the extra abstraction.

```kotlin
val fibonacci = memoize { n, recur ->
	if (n == 0 || n == 1) 1 else recur(n-1) * recur(n-2)
}

// The second argument for func is self recursive
fun <TIn, TOut> memoize(
	func: (TIn, (TIn, (TIn, ...) -> TOut) -> TOut) -> TOut
): (TIn) -> TOut
```

So why is this so much easier in Python? It has to do with how function dispatch works between the two languages.

- In Kotlin, the symbol for a function is resolved at compile time, which means that you have a chicken and egg problem - the pre-memoized version can't see the memoized one.
- In Python, the symbol is resolved via name lookup at runtime, so the memoized version becomes what the pre-memoized version refers to. See also the LEGB rule for details on that.

Finally, thanks to both the ["someone else's solution"](https://iliyangermanov.medium.com/kotlin-function-memoization-for-practioners-c1950b7881f0) that convinced me this was possible (but I was sure I could make it better!) and to the Wikipedia author who described how to do [a Y Combinator in an imperative language](https://en.wikipedia.org/wiki/Fixed-point_combinator#Imperative_language_implementation). This was just enough breadcrumbs to get me to this solution.
