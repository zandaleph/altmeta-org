---
title: "Speedrunning a Website Rewrite"
date: "2025-05-20"
lead: "Now serving version 4. Please excuse our mess."
shortname: "webspeedrun"
---

Over the last 36 hours I rewrote all of Altmeta.org from scratch. I've operated this small website for some time, but it got into a state a few years ago where I couldn't add new posts. I made an elaborate plan to revamp, but that failed to materialize, so the website went neglected for a long time.

Yesterday, between being asked for a personal website link and having some encouragement from Threads, I decided it was finally time to get my website back up.

I knew from the failed attempt that I wanted to use Next.js hosted on Vercel - I've followed what these are doing with great interest over the past five years and I believe they're bringing a plethora of not-easy best practices to the masses. It helps that others agree with me and have written a great deal of tutorial content about the combo over the past few years as well, because it means that AI coding assistants are really dialed in for helping accelerate code writing here.

I'm actually fairly intentionally not using most of the features of Next.js / Vercel's hosting - This is a static website, and I'm only using these pieces for "easy" static site generation and free hosting. I don't need ISR or want "use server" magic APIs. However, it's a great way to practice staying up to date with cutting-edge React, and it really shines a light for me on what's actually easy and what has surprising pitfalls.

I'll heap a load of praise on ReactMarkdown. Not only is it built on top of a stellar foundation (remark), but it has extremely safe and sane defaults. Unfortunately one of those defaults was the inability to put HTML directly into my markdown files, so one of my articles that relied upon an internal ToC with header ids was not supported by the default set of transforms. I found a workaround but haven't been able to test it out yet, so that's still slightly broken as of this writing.

The other thing I had to put off supporting was MDX. I had a couple of articles which made use of this, and ... yeah, it seems like the heyday of MDX has come and gone. If you missed that wave, it was the idea of putting JSX directly into your markdown files - you can see the potential problems with your eyes closed. I might look into figuring out how to support those articles again in the future, maybe with a JS fiddle or modern equivalent, but I decided it was okay to break for now.

Probably the worst pitfall I experienced setting up the website was image optimization. On the previous version of this website, I didn't do any image optimization, I just served the same png file to all comers. But Next promised me image optimization, and by golly I wanted it. Only...

Then they pulled a fast one on me and quietly noted that they do zero image optimization for statically generated sites. Worse, they'll serve my image assets with zero caching for extra slowness.

Luckily, there's a package to resolve this problem, with the straightforward but awkward name "next-export-optimize-images", which does what it says on the tin. Now I have a different problem, which is that all my smallest images got upsampled to be absolutely huge and the flow of some stuff is all off now, but that's a problem to deal with tomorrow.

There's actually a couple other features still missing as well - next/prev links, as well as last edited link to GitHub. I'll get them back soon.

For now, it's good enough that I can post there again. I'll probably backdate my last two threads up as posts as well. And you can check the entire [source code out on github](https://github.com/zandaleph/altmeta-org).

And yeah, a an AI coding assistant helped a lot with this. Sometimes it got in the way, but on net I wouldn't have even attempted this if I didn't know I could lean on that to keep my momentum moving forward. I'll break down the details (good and bad) another time.
