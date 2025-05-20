---
title: 'The Unforseen Perils of Dependency Upgrades'
date: '2020-05-30'
lead: 'In which I enjoy a good laugh about the past'
---

Remember 16 weeks ago when I wrote [a post about all the things I wanted to
build]?  No?  That's okay, neither do I.  But as it turns out, I included this
foretelling paragraph:

[a post about all the things I wanted to build]: /weblog/zack/2020/02/where-do-we-go-from-here/

> It's always dangerous to talk about upcoming plans, since no plan survives
  contact with the enemy (or reality), but I'm willing to preemptively accept
  that my prognostication will be wrong somehow and that we can revisit this
  later and share a good laugh.

Well, it's officially time for that laugh.  Ahahaha, haha, ha.  Great.

So what happened?  Well, the fairly non-sequitor [post about home remodelling]
was one thing.  I spent over 40 hours of my life learning how to draft
architectural drawings by hand instead of devoting more time to this blog.  Will
this ever be a useful skill again?  Don't look at me for predictions about the
future.

[post about home remodelling]: /weblog/zack/2020/03/lessons-i-learned-from-my-remodel/

But a bigger roadblock turned out to be dependency upgrades.  After only four
months since starting fresh, the code I depended on was old, obsolete, in need
of catching up to modern times.  It was time to upgrade.

Now, most library authors understand the difference between a backwards 
compatible change and a breaking change, so you at least have some warning when
upgrading a dependency is likely to cost you more than a few keystrokes at
the command line.  But the dark reality of open source is that unless a project
is outrageously popular, the level of support for versions other than the
bleeding edge is exactly zero. After a major version release, you live in limbo
until you can migrate to the newest hotness.

Unfortunately, migration requires work.  Between my last technical post and this
one, there are 15 commits to the backing repository:

* 1 for the house remodel post (content!)
* 1 for applying code formatting to my blog posts.
* 2 for new features.
* 4 for bugfixes of my own bugs.
* 7 for upgrading dependencies and migrations.

Half of the non-content commits are solely on keeping up with the rat race that
is upgrading depedencies.  Somewhere in April I gave up because I was having so
much trouble migrating, and didn't pick things up for a month.  Coming back
fresh has allowed me to finish all the migrations necessary, but it was not
without compromise.

So what broke?  What wasn't working?  In short, we had:

* An upgrade to MDX upgraded the underlying Markdown processor and broke
  footnotes.
* An upgrade to the code snippet formatter completely changed how "extra"
  language plugins needed to be made available.
* TSLint was deprecated in favor of ESLint with typescript support.

So let's take them in order.

From time to time I get very parenthetical in my writing (like this!) and to
ensure that the most non-sequitor of my thoughts do not detract from the flow
of the core ideas, I often use footnotes.  You can see the most complicated
example thus far [on this post].  Footnotes are part of the [extended markdown
syntax], and thus are not as well supported as other features like headings and
links, but I've generally found them to be usable in the past.

[on this post]: /weblog/zack/2014/01/operations-and-operational-improvements/#fn-1
[extended markdown syntax]: https://www.markdownguide.org/extended-syntax/#footnotes

Two things happened that did not work well together.  First, I started using
[Prettier] to automatically format my markdown code.  I'm a huge fan of
automatic formatting, and would prefer to not work in any language where one
is not available.  Second, I upgraded my version of MDX, which upgraded the 
underlying Markdown processor [Remark] and changed how footnotes were processed.

[Prettier]: https://prettier.io/
[Remark]: https://remark.js.org/

Unfortunately, these two tools do not currently agree on how footnotes should
be formatted[^1].  Prettier wants to format multiple paragraph footnotes as:

```markdown
[^1]:

  I have a funny story about this that I am not quite prepared to tell at
  the moment but want to tell someday.
```

However, after the MDX upgrade this gets rendered as an empty footnote and a
paragraph in the main body of the post.  For my posts, this left a bunch of
seemingly random musing to close out many posts, followed by some empty
footnotes.  I could not publish new articles in this state.

I tried filing a bug, but I filed it with the wrong project and I didn't do a 
good job of explaining myself anyway, so I got disheartened with trying to fix
the tools I'm using.  I walked away for a while, and when I returned I decided
to forego using Prettier for markdown for now, and to simply format the
footnotes as the new markdown parser wants, a la:

```markdown
[^1]:

    I have a funny story about this that I am not quite prepared to tell at
    the moment but want to tell someday.
```

(Note the _four_ space indent.  Anyone who complained about Python's
syntactically important whitespace is gonna love this.)

Next up, we had [`gatsby-remark-vscode`], a remark plugin for using [VS Code]'s
language highlighting extensions to highlight code blocks in markdown.  They
just had a major upgrade to a 2.x version, and the biggest change was how
extensions are loaded.  Previously, you just named the extension and they were
downloaded as part of the build.  This was great for a toy, but not so good when
you're doing lots of builds and need them to not fail randomly when the web
server throttles your requests.  In version 2.x, you now have to have
pre-downloaded all your extensions and point to where they exist in order to use
them.  This is, all in all, a major improvement.

[`gatsby-remark-vscode`]: https://www.gatsbyjs.org/packages/gatsby-remark-vscode/
[VS Code]: https://code.visualstudio.com/

The issue is that their migration instructions are incorrect.  I tried following
their migration guide, and got errors that the extensions I had could not be
found.  I eventually had to go read the source code to find I had to explictly
point to the `package.json` file in each package in order to get them to load.
Even after figuring that out, there was an indication I could add these
extensions to my own code's dependencies and make installation of future
extensions easier.  This, also, turned out to be misleading, as node does not
know how to import malformed modules, and VS Code extensions use a different
schema for `package.json` files which is incompatible with node.  So I spent
a few hours fruitlessly trying to get that to work as well.

Finally, TSLint to ESLint.  This one was partly my fault for being harder than
it needed to be.  When I added TSLint I did so in a pretty permissive way, a lot
of things that were pretty unsafe were allowed to skirt by.  In my defense,
that's a sane way to add any linter at first.  Then you ratchet up the
strictness of your linter as you have time. But it meant that when I ran the
migration script, it didn't really know what to do.  I got a new configuration
file that either didn't work or was unmaintainable, and again walked away for a
bit.

After a week, I was able to come back, acknowledge that I'd rather have a new
configuration file built by hand, and get to work.  Of course, it was easier to
built a strict configruation file, and that meant that it was time to fix all
the sloppy code I still had lying around.  This turned out to only be an hour's
work - at a certain point I decided there were some errors I was okay with for
now and that it was time to move on.  It means I can't make the build depend on
the linter just yet, but I'm a lot closer than I was before.

After all this, things are up and running again.  It was a pain to slow down and
work through the more difficult upgrades, but in general the code is better for
it.  With a bit more work, even the corners I had to cut to be operational again
will be squared again and I can find new wrinkles to work on instead.

I am considering adding [Renovate] to my repository, which is an automatic 
process which tries to upgrade dependencies.  From what I can tell, it runs your
build to see if it's safe to upgrade, then either commits the upgrade or files a
task for you to investigate why the upgrade breaks your build.  It would likely
reduce some of the work I currently have to do by hand, and would give me an
earlier warning system that breaking changes need my attention.

[Renovate]: https://renovate.whitesourcesoftware.com/

What's coming up next?  I might write about the few new features I added
or I might move on to the next bit of code outside of what's necessary to run
the site itself.  After the last few months, though, I'm hesitant to make as
bold predictions about the future as I once was.

[^1]:

    Both Prettier and MDX use Remark as their underlying parser so I don't
    really know why they don't agree.  Presumably one uses the footnotes plugin
    and the other does not, but I haven't had time to look.