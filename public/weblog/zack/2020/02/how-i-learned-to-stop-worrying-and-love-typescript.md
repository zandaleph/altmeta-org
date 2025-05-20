---
title: 'How I Learned to Stop Worrying and Love Typescript'
date: '2020-02-04'
lead: 'In which static types uncover bugs, surprising noone'
---

In thinking about my future plans (subject of a future post), I realized that I
wanted the help of a static typechecker to make writing javascript easier[^1]. I
use [flow] at my day job, so I thought for sure I'd just keep using that for
this project, but I quickly surprised myself by switching to [typescript]
instead. As recently as three weeks ago, I was deriding typescript as an inferior
flow, but I have seen the error of my ways and adapted accordingly. This post
will go over why I switched, what I had to change to move to typescript, and the
bugs uncovered already by bringing in a bit more rigor.

[flow]: https://flow.org/
[typescript]: https://www.typescriptlang.org/

As I said, I was already familiar with flow so I set out to add flow to Gatsby.
I immediately noticed there weren't a lot of resources on the topic, which was
unusual for Gatsby. I did find [this terse article], which didn't get into a lot
of detail and the author seemed fairly new to flow, but at least pointed me at
[gatsby-plugin-flow], which setup the necessary pieces to compile flow types out
of the generated code. So far so good.

[this terse article]: https://medium.com/@sgpropguide/adding-flow-types-to-gatsbyjs-baeb6bc0c02
[gatsby-plugin-flow]: https://www.gatsbyjs.org/packages/gatsby-plugin-flow/

The issue came when I wanted to have type definitions for the libraries I was
using, like Gatsby and Amplify. These libraries have their own functions and
callbacks, so in order to have type safety within my code the typechecker needs
to know the types they expect and emit. Without these, I can only be really
type-safe within my own code that doesn't directly interact with external
libraries, which is a vanishingly small amount of code.

Both Flow and Typescript allow you to define types for javascript packages
outside the package if they aren't typed inside, and offer a library of
community provided definitions so that static typing enthusiasts can help each
other out. I had previously assumed that they were about the same size, but this
turns out to be wrong. Flow's "flow-typed" repository has about a hundred
libraries covered, whereas Typescript's "definitely typed" repository has tens
of thousands. The reason for this is simple - [Flow doesn't currently support
nested dependencies][flow sad].

[flow sad]: https://github.com/flow-typed/flow-typed/issues/1857

This meant that it wouldn't just be more work to use flow, but instead that I
simply could not use it without giving up type safety - the raison d'etre of a
static type system. So I swallowed my previous objections and started trying to
use typescript instead. This, by contrast, was surprisingly straightforward - I
was able to migrate everything in a day with no prior experience.

I followed [a straightforward guide] for setting up my typescript-ified gatsby
infrastructure and ended up with [a fairly short commit]. After that, I set to
work converting every `.js` file in my repository to `.ts` (or `.tsx`, because
Typescript is pickier about that). This wasn't too bad - I've got less than 20
of them at present, and you can see the bulk of it [in this meandering but short
commit]. I'll spend the rest of this post discussing the interesting bits.

[a straightforward guide]: https://blog.maximeheckel.com/posts/getting-started-with-typescript-on-gatsby-8544b47c1d27
[a fairly short commit]: https://github.com/zandaleph/bookish-carnival/commit/8523321970639a3ed1938ace4760e155a0d3e77f
[in this meandering but short commit]: https://github.com/zandaleph/bookish-carnival/commit/b1364f7134ffe64fbad8485fd67dfbff80a61bc0

The first thing I caught was [a legitimate bug]. The template I started from
included a user-pool gated backend, and when you are logged in a "Sign Out" link
is displayed in the header. However, typescript was unhappy with the argument
to the `.then()` function on the future returned from `Auth.signOut()`. Even
being familiar with futures, it took me over ten minutes to spot this change:

[a legitimate bug]: https://github.com/zandaleph/bookish-carnival/commit/b1364f7134ffe64fbad8485fd67dfbff80a61bc0#diff-e2471acc7248081dc1bd135bbe6192ffL30-R35

```diff
  <a
    onClick={async () => {
      const { Auth } = await import('aws-amplify');

      Auth.signOut()
-       .then(logout(() => navigate('/backend')))
-       .catch(err => console.log('eror:', err));
+       .then(() => logout(() => navigate('/backend')))
+       // tslint:disable-next-line:no-console
+       .catch((err: string) => console.log('eror:', err));
    }}
  >
    Sign Out
  </a>
```

Previously I had been supplying the result of the `logout()` function as the
`.then()` callback, but since that function returns `undefined` that doesn't do
very much. It worked because this was all in an `onClick` handler, so if we
navigated to the backend while the signOut logic was running it wasn't a huge
deal, because it still needed user input to start. However, I'm sure the
intended behavior was to complete sign out first, then clear the local data,
then navigate to the login screen, which is what the code now does. So thanks
typescript for catching that bug.

Next up was an import that stubbornly kept looking for a `.js` file after I have
converted it to a `.tsx` file. [Once I found the bug] (in an MDX file, which is
why I didn't think to look there sooner), I had to laugh at my previous error:

[once i found the bug]: https://github.com/zandaleph/bookish-carnival/commit/b1364f7134ffe64fbad8485fd67dfbff80a61bc0#diff-cf44432743905c81594d04b6688860e7L7-R7

```diff
- import TodoApp from '../../2019/12/TodoApp.js';
+ import TodoApp from '../../2019/12/TodoApp';
```

The next change wasn't a bug per-se, but an improvement driven by typescript
nonetheless. For the login-gated sections of the site, I previously had a HOC
(of sorts) called `PrivateRoute` which took a `component` parameter and then
passed the rest of its parameters to the passed component if you were logged in.
I was struggling to define the type of this HOC, and I read some advice that
suggested that now that hooks are a thing, many HOCs could be replaced with
hooks instead, which are much easier to add types to. So I write [a `usePrivateRoute` hook][useprivateroute], and it looks like this:

[useprivateroute]: https://github.com/zandaleph/bookish-carnival/commit/b1364f7134ffe64fbad8485fd67dfbff80a61bc0#diff-6fcea515b9ecd2133728e998fbe32238R5-R13

```typescript
export default function usePrivateRoute(): boolean {
  const shouldStay = isLoggedIn();
  useEffect(() => {
    if (!shouldStay) {
      navigate('/');
    }
  }, [shouldStay]);
  return shouldStay;
}
```

And using this new `usePrivateRoute` hook [is a simple change]:

[is a simple change]: https://github.com/zandaleph/bookish-carnival/commit/b1364f7134ffe64fbad8485fd67dfbff80a61bc0#diff-17945d025a6fb19b406b70cdcdf53a17R9-R13

```diff
- export default function Home() {
+ export default function Home(props: Props) {
+   const loggedIn = usePrivateRoute();
+   if (!loggedIn) {
+     return null;
+   }
```

Typing my dispatcher actions from the example todo app was a fun exercise. I
elaborated what each of these meant [in my last post], but now [I can be
explicit] about what actions are allowed without relying on convention:

[in my last post]: ../../01/breakdown-of-yet-another-todo-app/
[i can be explicit]: https://github.com/zandaleph/bookish-carnival/commit/4d29c36c7e477ae90f22c6dc056a88eb8cae8de0#diff-f64e7d5b9e5087a66838a98cb9f4507fR7-R13

```typescript
export type TodoAction =
  | { type: 'SET_TODO'; todo: Todo }
  | { type: 'SPLIT_TODO'; start: number; end: number }
  | { type: 'MERGE_PREV_TODO' }
  | { type: 'MERGE_NEXT_TODO' };

export type IndexedTodoAction = TodoAction & { index: number };
```

Finally, I had to type the result of all the static GraphQL queries that Gatsby
uses at page generation time. Initially I did this manually, but this resulted
in duplication of code and guessing at the types of various GraphQL fields.
Then I found [gatsby-plugin-graphql-codegen], and it allowed me to [replace
manual type definitions with autogenerated ones]!

[gatsby-plugin-graphql-codegen]: https://www.gatsbyjs.org/packages/gatsby-plugin-graphql-codegen/
[replace manual type definitions with autogenerated ones]: https://github.com/zandaleph/bookish-carnival/commit/f078106875c2b444547163ad639fa9b6446dc8be#diff-7083e1969f4bdb1a955f6801bdd629b6L7-R7

```diff
- interface Query {
-   allMdx: {
-     totalCount: number;
-     edges: {
-       node: {
-         id: string;
-         frontmatter: {
-           title: string;
-         };
-         fields: {
-           slug: string;
-         };
-       };
-     }[];
-   };
- }
+ import { BlogIndexQuery } from '../../types/graphql-type';
```

Looking back, one major psychological difference between flow and typescript
that I had been stuck on is how they position themselves with regard to
javascript. Flow claims to be "a static typechecker for javascript", whereas
Typescript is "a typed superset of JavaScript that compiles to plain
JavaScript". To me, this has always indicated that flow is "merely" adding type
annotations to javascript, while Typescript is a "whole new" language that I'd
have to learn. Yet, flow syntax is something which must be compiled out in order
for it to be valid javascript, and conversely all javascript [^2] is valid
typescript, so the two are not as dissimilar in approach as I had been led to
believe. Once I realized this - that they were effectively two implementations
of the same solution, it became easier to wrap my head around what typescript
had to offer and embrace it as my solution.

[^1]:

    Javascript is a dynamic language, which generally means that every value can
    be anything - a boolean, a number, a string of characters, even an object with
    many properties each of which can be anything. This freedom means it can be
    quick to write and change, but if you use something in a way which wasn't
    expected, the program fails in hard to debug ways. Adding a type checker
    requires me to declare what types everything is, but then checks my code as I
    write it to make sure I don't break any of the typing rules I create.

    I appreciate that "easier" is a non-obvious description here. The word
    that is usually applied is "safer", but I contest that safer in this context
    means enough fewer bugs that development truly is easier as well.

[^2]:

    There are lots of versions of javascript right now and I'm really new to the
    space so I'm not sure if _all_ javascripts are valid typescript but certainly
    the less cutting-edge features are present (for example, the
    [nullish-coalescing] operator `??` is supported).

[nullish-coalescing]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing
