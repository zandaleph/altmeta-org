---
title: 'Where Do We Go From Here'
date: '2020-02-08'
lead: 'In which we discuss the future of this blog'
---

[Altmeta.org](/) has been around as a blog since the end of 2013, a bit over
seven years ago. The posts have, in general, been about the infrastruture I set
up to run the site. In a way, it has always been a guide should I ever need to
replicate my setup; a record of decisions made and their justifications. It has
also been an attempt to build a tiny fraction of what I work on at my day job
without all the tools and support a large company provides. To that end, I've
learned a lot even if a lot hasn't been accomplished.

As this is the twelveth post, and six of those (including this one) have been
since the move to Gatsby, I feel like it might be time to talk about something
more than infrastructure. One could argue that talking about [how the example
Todo app was built] was already a step in this direction, and it is in this
direction I intend to head for a while.

[how the example todo app was built]: /weblog/zack/2020/01/breakdown-of-yet-another-todo-app/

A few weeks ago I knew I was heading towards this pivot and wrote a list of
posts I wanted to write. The first, three, of course, are already done:

1. [“How a Simple Todo App Isn’t Simple”][first]
   - This was an expansion of some ideas mentioned in the previous post

[first]: /weblog/zack/2020/01/how-a-simple-todo-app-is-not-simple/

2. [Walkthrough of TODO codebase][how the example todo app was built]

   - This is the first "non-infrastructure" post I mentioned earlier

3. [Typescript!]

   - This is the previous post, and was very infrastructure heavy.

[typescript!]: /weblog/zack/2020/02/how-i-learned-to-stop-worrying-and-love-typescript

After these three, I knew I would be here, in a good position to pivot, so:

4. This list + 20x20 preview

It's always dangerous to talk about upcoming plans, since no plan survives
contact with the enemy (or reality), but I'm willing to preemptively accept that
my prognostication will be wrong somehow and that we can revisit this later and
share a good laugh. What I'm going to try to avoid is stopping altogether after
this post - that would be the real travesty.

Which brings me to the 20x20 preview which makes up the other half of this post
(per the plan). In honor of 2020, I formulated my goals for the year as a list
of 20 goals, each of which is 20-themed somehow. Relevant to not stopping, one of my
20 goals was to add 20 posts to this blog before the end of the year. So in
seeking to make that happen, we'll need 16 more after this one. More on 20x20
to come shortly though.

5. Something about updating website template
   - Wider content (80 char code blocks)
   - Next / Prev links
   - Phone form factor?

I wanted to have one last infrastructure post (haha, this "last" won't survive
to the end of this post) since I don't feel like I've done the tweaking of the
base style selected that I hoped to do. So this will be a time boxed overhaul
of the layout component and the front page, plus the standard description of
what I tried, selected, and learned.

6. Describe Model, Viewer for 20x20 App
   - Static data
   - Shared viewer with later articles
   - Progress bar for each with overall (segmented?) progress bar
   - Click to expand with details
   - Support multiple kinds of goals (distinct event, divided goal, measurable
     sub-event)
   - Support multiple goal schedules (not starting until / finishing by XX)

Coming back to the 20x20 goals, I'm currently tracking these in a private Trello
board which I have bent to this purpose. However, it occurred to me that it
could be a reasonable step up in complexity from a Todo app with which to
practice and demonstrate some web application patterns. So by building an app
to visualize and record goal progress, I can also provide a bit of a backlog of
posts to this blog (assuming I can write the app expediently).

I'm not actually sure now if this will be one post or two. If it is two, I'll
spend the first one on the viewer (hopefully with a demo), and then the second
one on the model that lies behind the view. I'm still working out what features
I want the viewer to have (big question: do we support viewing the past or not),
and from that driving how the model needs to be structured. If I go for
something more complicated, then I'm likely going to need multiple posts to
cover the additonal ground.

7. Describe AWS Setup
   - GraphQL Schema
   - AppSync?
   - AuthZ? Publicly read data so ACLs matter

This is an infrastructure post, kinda. In order to support a data editor for
the 20x20 app, we'll need to support storing the data somewhere and allowing it
to be accessed later. I want to only allow myself to add data, but want much of
it to be publicly visible, so figuring out how to enforce that securely is also
part of the equation here. But so is mapping my data model to DynamoDB, or
whatever other data store I choose to use (It'll be DynamoDB).

8. Describe Data Editor
   - Only works when logged in
   - Need “fake” backend for interactive blog post

Finally, I'll create a post talking about the second "viewer" app which allows
modificaiton of the data. This one is a bit tricky because I'll need to create
a separate backend which simulates whatever mutation framework I'm using for the
real deal, but I'm going to optimistically assume that's not a big deal and go
ahead and assume this will be a relatively easy post. That just leaves the
editor app itself to be the hard part, which again depends on how complicated a
data model I choose to support.

9. Next app: Gallery
   - Talk about features, why I want to host my own
   - Password protected?
   - Companion app for phone syncing

After doign the 20x20 app to death, I want to take on a new app - a photo and
video gallery. Long story short - I think the paid photo gallery options are
overpriced, the free ones aren't private enough, and none of them are
self-hosted. So I'd like to take a stab at creating my own, complete with React
Native client so that I can take pictures on my phone and have them
automatically upload to my cloud-based photo gallery.

I'm hoping my experience with the 20x20 app will give me some guidance on how to
do this - authZ, data modeling and access patterns, building an effective viewer
are all included in both projects. But we'll see how many other things I need
to support - blog storage for photos and videos, automatic thumbnail / various
resolution creation, how to keep costs down and avoid running any servers I need
to maintain, etc.

10. Talk about indexes and issues therein - aka cost.

And speaking of maintaining servers, the big bugbear I'm afraid of for running a
gallery is indexing. When you have infinity money, running a cloud-based search
server is fast, super effective, and easy. However, it isn't cheap - you're
basically guaranteeing you'll need to run two or three servers 24/7 in order to
support your use case. And, if you're talking about a private gallery which
will only be searched occasionally, paying for that to be ready all the time is
a waste of money and computing resources. So I'll (likely) need to figure out
ways of incrementally computing and updating indexes without runnign any
servers, which may prove a bit challenging. But I like challenges, so it should
be fun too.

So, that lays out the next 6 or 7 posts, as well as two separate applications
I'd like to write this year. I'll still need to come up with another 10 to make
my goal of twenty, but I suspect the gallery will be an endless font of
opportunity as I tweak and add features. For many reasons I'm looking forward to
getting started, which is what I'm going to go do now.
