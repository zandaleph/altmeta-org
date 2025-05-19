---
title: 'How a Simple Todo App is Not Simple'
date: '2020-01-15'
lead: 'In which the side, project overwhelms the original goal'
---

To demonstrate what MDX allows me to do in posts, for my recent ["how to upgrate
to MDX"] post I decided to write a small, simple Todo App as an example of what
could be embedded. This decision deplayed publishing by three weeks as adding
polish to them demo took far longer than actually writing the content. This is a
retrospective on why I made the decision, what unexpected challenges arose, and
lessons learned.

["how to upgrate to mdx"]: /weblog/zack/2019/12/upgrading-gatsby-to-mdx-from-remark/

Todo Apps are the staple example of "look how easy it is to do things" in
basically every javascript framework ever. They are, in many ways, a perfect
example - you can cover lists of similar items, event handling, how you
integrate with the design of your site, external or local data storage; the list
goes on. Plus, basically everyone has used one so what they do is immediately
obvious and you can focus on the implementation.

However, for all these examples out there in the wild, you have in many ways the
same problem that most code does - reuse is hard. While I'm sure some brave
souls have tried to publish reusable Todo Apps as open source to be embedded in
other websites, the fact of the matter is that we stil haven't figured out how
to do so in a portable way. Today if I reused someone else's Todo App, I'd have
some problems:

1. I'd still have to provide styling so that it fit with the theme of my site.
   This would mean learning whatever styling mechanism the existing code
   supports (if any) and duplicating my styles into their non-standard format
   (making it harder to change my own design).
2. While npm has improved my ability to get updates to code packaged by other
   developers, now I have the worry that a future update to the reused code
   would break my usage. Detecting when that happens either requires extensive
   testing of library code (usually somewhat of an anti-pattern), or
   user-reported problems later on (which I'm not keen on).
3. If I want to customize the behavior in a way which isn't supported, I have to
   fork the code and hope for an upstream merge. While I wait for the merge I
   miss out on new features, and when the merge happens all other users risk the
   previous issue that the new changes break someone else's usage.
4. It would probably do more than I wanted due to accumulating features over
   time from all these merge requests.

So instead I engaged in the time honored tradition of copying someone else's
code and fitting it to my purposes. In this case, [I primarily used this
tutorial], since it was hooks-based and I liked the button-less design. But of
course, it wasn't good enough as-is, so we had to start adjusting.

[i primarily used this tutorial]: https://upmostly.com/tutorials/build-a-todo-app-in-react-using-hooks

First and most obvious change: I don't use separate CSS files in my website - I
rely on the Emotion JS-in-CSS library to style my components. So, I needed to
translate from raw CSS to component-level CSS. Luckily, this is basically as
simple as typing `` const style = css` `` and pasting the relevant style code
after that. There's a few other details: you no longer need a classname so you
can remove the `.todo-list {` before the CSS rules for that component, and you
can nest rules using the `&` target which means "relative to me", so `&:focus`
is how you specify the focus pseudo-selector. These details and more are
described in the Emotion docs.

I willl call out the one thing that really threw me was that if you want a
backslash in your CSS you need to double it up because otherwise it is
interpreted as a javascript escape. See the snipped below for an example.

```javascript
css`
input:checked {
    &:after {
      content: '\\2713'; # like this
      # content: '\2713'; # not this
```

The second change was in response to a seemingly innocuous comment on the
original article: "Can you talk why you haven’t used native checkbox input type
and leveraged custom checkbox?" - the response there was that they wanted to
show more of how components work, but left unsaid is that styling checkboxes is
a decade-long problem and it was likely left off because it is hard and fixing
it would overly-complicate the original example. But I didn't know any of this
at the time and said "mine will use native checkboxes because a11y matters" -
and this is why the last post was three weeks later than I had hoped.

You see, for historical reasons form elements are, by default, natively rendered
by the operating system because at some point that was faster or something.
Basically nobody has wanted this behavior since forever, but we're stuck with
this weird HTML/CSS wrinkle where you can do all sorts of crazy animation and
styling to basically everything except `<input>`. There have been plenty of
workarounds to this in the past, and arguably the one I used is still a
workaround, but if you don't want your checkbox appearance to be at the mercy of
whatever operating system your user is running, it's going to get a little
hairy.

As this is a decade-plus old problem, you can find plenty of solutions to this
problem on the internet. One little wrinkle most sites won't tell you about -
they replace that OS-rendered checkbox with a CSS-rendered one! Yes, for some
reason[^1] most CSS wizards think rotating a box 45 degrees and drawing two
sides is a better solution than using the unicode symbol for a checkmark. It
took me a bit longer to find a solution that used unicode, but it was a good
reminder that blindly using sample code on the internet can lead to
unanticipated (and therefore unreadable later) features appearing in your code.

Finally, I spent a while changing the behavior of the demo itself. What had
drawn me to the chosen demo was it's handling of enter (create new todo) and
backspace (delete empty todo), but I felt like that missed a few interactions
that would make things even more intuitive. Specifically, that creating a new
todo would respect cursor position (and split a line if needed), and that the
inverse would work - backspace at the beginning of a todo would merge with the
previous item. So I modified the `onKeyDown` handler to pay attention to cursor
position and act accordingly. Interesting lesson learned doing this: cursor
position is actually two positions, a start and end of selection. I'll go more
into how I structured the app in my next article.

As I mentioned last time, enacting all these changes took a few days of effort -
far more than simply using an off-the-shelf solution would have taken. Was it
worth it for solving the above problems? Since the goal of this whole website is
currently for my own learning, it was a better use of my time to learn
widely-used technologies like CSS, Emotion JS, and React than it would have been
to learn a lesser used library. Also, because there isn't much risk of a
security problem with a Todo list that immediately forgets everything you added,
I'm not benefitting from a larger community of developers fixing problems over
time. But in another context, or with another project, these tradeoffs are
different, which is why getting a reliable intuition for the build versus buy
decision is so important as we grow as developers.

[^1]:

    In fairness, there are good reasons to prefer a drawn checkbox: consistent
    look, predictable location within the bounding box, and customizability.
    However, I don't believe you should use CSS to create icons - unicode offers
    an array of well-known and, therefore, meaning bearing symbols. If the
    advantages of the CSS method outweigh, I'd probably use SVG instead (though it
    is likely less effective from a raw content size standpoint)
