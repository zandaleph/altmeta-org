---
title: 'Broken Computer, New Website'
date: '2013-12-20'
lead: 'In which I emit my first thoughts on this weblog.'
legacyPath: '/weblog/zack/2013/12/broken-computer-new-website.html'
---

It has been about 4 years since I last ran a personal website. I've had
[altmeta.org](/) the whole time, but deciding what I wanted to do with it took
time.

Part of the trouble is expense: I build enterprise-scale websites and services
for a living, and I'm accustomed to a certain level of fault tolerance and
operational excellence. For personal and smaller websites, it simply isn't
practical to run a three tier architecture with no single point of failure. The
simplest such setup I could think of would cost about \$160 / month [^1].
Compared to some other hobbies, this is still pretty affordable, but I felt like
I could get many of the same benefits for less investment. This thought led me
to research many options, but none ever got as far as implementation.

And then a fortuitous thing happened - my laptop died.

I loved my laptop, a refurbished [2008 17" MacBook Pro]. Much like the G5 tower
I had owned before it, I promised myself that if I was going to spend that much
money on a computer I was going to use it to the bitter end. With the exception
of a failed battery around the end of year 3, the computer worked flawlessly for
its entire life. I couldn't have asked for a better experience.

[2008 17" macbook pro]: http://support.apple.com/kb/sp4

Computers, like people, tend to accumulate baggage over time. For both, this is
not necessarily a bad thing. People are more interesting when they have stories
to tell, and computers are more interesting with stuff on them. Even as we move
to more cloud based services [^2], we still tend to install some programs and
modify some configuration parameters on our computer over time. Sometimes, we
don't notice these changes until we move to a new computer. Other times, they
slow us down before we get there.

OS X ships without a package manager, so the community has created multiple
options [^3], each with their own pros and cons. Over time, I tried out a number
of these systems. Part of the problem with this is that I had no idea what I had
installed, and there was no simple way to find out. I probably had 4 versions of
ruby installed, and I had no idea how I was supposed to update java to 1.7. As
such, I tended to get caught up in tracking down dependency issues instead of
working on productive things like putting a website together.

I had a plan to build myself a new desktop PC for gaming. Part of this plan was
that once the new PC was up and running, I would backup all the important stuff
off my laptop and wipe it clean, so I would stop running into these issues. I
could once again have a clean machine, and just install the tools I needed to be
productive. Of course, this all revolved around me actually buying parts and
putting stuff together, and I've been out of the PC building game for long
enough that I was paralyzed by choice there as well.

When my laptop died, I was left with no personal computer, and I made the snap
judgement to go out and buy myself a shiny new [2013 13" MacBook Air]. Suddenly,
I found myself with all the freedoms I had asked for. On top of that, the move
from a 17" screen to a 13" screen was somewhat jarring, so I needed to prove to
myself that this computer would work for what I wanted to do with it.

[2013 13" macbook air]: http://support.apple.com/kb/SP678

So, the general idea was to follow [AWS's guide to hosting a static website].
This guide worked beautifully, and the best part is that running this website is
super cheap. Barring any massive DDOS attacks, the website costs about \$0.60 /
month to run, most of which is DNS. I also get minute-level access logs (hi
there web crawlers).

[aws's guide to hosting a static website]: http://docs.aws.amazon.com/gettingstarted/latest/swh/website-hosting-intro.html

But you know what the funny thing is? None of that guide required any of the
tools and environment stuff I had let get in my way previously. In fact, I
almost got distracted from following that guide by trying to install more tools
that I didn't need. I think this is the first lesson I needed in the 'less is
more' camp.

Could my website be shinier? Of course. Does hacking HTML by hand suck? You bet
it does. Are there lots of crazy ideas I have on how to improve this stuff? I
do, and now that I've got some momentum, I intend to follow through on some of
them. But I like the idea of making sure I document my process, and the more I
do the more I have to document, so I think I'll use that to encourage more of
'less is more'. Or, do I have that backwards?

Stay tuned for more updates. At this point, there's no comment box, so if you
have feedback for me you'll probably have to discover my email address and send
it to me the "old fashioned" way. Cheers.

[^1]: Based on [this pricing estimate from AWS].

[this pricing estimate from aws]: http://calculator.s3.amazonaws.com/calc5.html#r=PDX&key=calc-639B51B6-E11B-4714-B162-1D46CF9D2411

[^2]:

    We can do almost anything with just a web browser these days. Not just
    Google's [gmail], [calendar], and [documents]; but also music ([Pandora],
    [Spotify], and [Rdio], to name a few), [accounting], [taxes], and even coding
    ([GitHub]) and [JSFiddle], for example).

[gmail]: https://mail.google.com/
[calendar]: https://calendar.google.com/
[documents]: https://drive.google.com/
[pandora]: https://www.pandora.com/
[spotify]: https://spotify.com/
[rdio]: https://rdio.com/
[accounting]: https://www.mint.com/
[taxes]: https://turbotax.intuit.com/
[github]: https://github.com/
[jsfiddle]: http://jsfiddle.net/

[^3]: I used [Fink], [MacPorts], and [Homebrew].

[fink]: http://www.finkproject.org/
[macports]: https://www.macports.org/
[homebrew]: http://brew.sh/
