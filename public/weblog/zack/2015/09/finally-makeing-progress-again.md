---
title: 'Finally Makeing Progress Again'
date: '2015-09-13'
lead: 'In which we learn to not tear off more than we can chew.'
legacyPath: '/weblog/zack/2013/12/finally-makeing-progress-again.html'
---

Well, it's been a good long while since I last updated this blog - life has a
funny way of changing your priorities a bit. For a brief rundown of what has
been going on, here's a bullet-point list!

- Spent a couple months working on a javascript application I never published.
- Moved country.
- Travelled the world.
- Made a lot of new friends, and tried to keep up with old ones.
- Upgraded from a Spot instance to a Reserved Instance.
- Set up OpenVPN (subject for another article, if I can remember what I did).
- Got married.
- Had a lovely daughter (well, she's due in four weeks).

One of the biggest reasons I didn't post sooner is that I've not made much
progress on improving the infrastructure of my website. Instead, there have been
a fair number of false starts. As a result, my initial inertia gained from
having a shiny new computer leeched away until I stopped making progress.

As mentioned above, the one big improvement I made was getting OpenVPN set up so
I could proxy my internet traffic through a United States IP address. After
moving abroad, I suddently became aware of many websites change their content
based on what country you appear to be coming from. The really large ones are
also clever enough to know of common proxies and block traffic from them. As a
result, the only foolproof way to bypass this is to run your own proxy.

For whatever reason, the time I found to do that work was on vacation in Porto,
Portugal. My travelling companions were late risers, and understanding all the
things I needed to make OpenVPN work seemed the perfect thing to do each
morning. However, the vacation ended before I could write a blog post about it,
so I was back to my new job and never wrote about my experience. Hopefully I'll
get around to that while I'm off for a month - it was surprisingly difficult to
set up, and made me realize I'm not much of a sysadmin.

The other attempts at working on the website have been false starts, and those
starts fall into a few categories.

As mentioned, I built a small javascript application which was going to help
generate the graphs I had created for my last article. It would let you decide
which contract you would want for a reserved instance, based on your expected
uptime. Ultimately, I got tired of keeping up with the changing data format
which AWS exposed about their prices, and I felt dissatisfied with the code I
had written. As of this writing, these various options aren't even available
anymore, so the tool would have had limited usefulness anyway.

The second one was trying to dockerize my server - I spent a couple months right
after I stopped writing posts working with docker and ever since I've wanted to
figure out how to use docker to create reproducible deployments - the holy grail
of infrastructure. However, it turns out the technology is still a few years too
young for that, and I'm not willing to put forth the effort to advance the art
in that space at this time.

Next, I spent a little bit of time working on compressing the logs from AWS
about my usage, but without a clear way to deploy these tools to my server, I
ultimately gave up until I could finish figuring that out.

Finally, and the one I lost the most time one, was figuring out how to automate
deployments of new stuff from my laptop to my cloud server. Since right now that
deployment is the publishing of files to S3 and possibly a server restart, I
thought this would be a simple program to write. Unfortunately, I always got
caught up in the details.

One detail is that the startup script that I mentioned previously has to be
world-readable, which is not the default when uploading a new version of the
file. I imagined a tool which would be able to read a secondary file next to the
file I uploaded, something like startup.metadata, which would encode all the
extra settings to put on each file uploaded. But that would also mean I'd need a
way to download a file with this metadata file, which was more work. On top of
that, there's a lot of possible metadata to encode, and keeping up with AWS is
usually a losing battle, as I found with the pricing data.

I really got stuck on this issue - I wanted a theoretically pure way of doing
this work, but the details were always messy. In retrospect, I should have
arrived at the eventual solution a lot faster, but I got stuck on a bad solution
instead of revisiting the problem. A cautionary tale for all developers, that.

Ultimately, I decided to just solve my current problem instead of trying to
solve all problems at once. My problem was that I needed to keep some files in
sync with S3, and that one of them needed a different ACL. Once I looked at the
problem that way, the answer was obvious - a simple Makefile would suffice.

Since I operate two buckets, I ended up with two Makefiles - it was just easier
to reason about that way. I also added a currently unnecessary step of creating
separate build and upload steps, but I am hoping this will be useful as I start
to generate some of the artifacts instead of merely uploading static files. Time
will tell, I suppose.

Here's the more complicated makefile, for reference.

```makefile
build:
	mkdir -p build
	cp -R data/ build/data

upload:
	aws s3 sync build/data/ s3://org.altmeta.data/spot-1/
	# make sure startup is publicly readable
	aws s3api put-object-acl --bucket org.altmeta.data --key spot-1/startup --acl public-read

clean:
	rm -rf build
```

One thing to note is that this approach is really not portable. The aws cli
relies on environment variables which are set by my `.zshrc` file. If I tried to
automate this on a server somewhere else, it would need to have the same setup,
which I have not captured in any useful way. But that is also configuration that
doesn't really belong in the makefile, so I can put off figure out how to solve
that problem for a later day.

So, now that I can upload new files again, what will I do next? I took a look at
the log bucket, and there are a lot of files there. I might look into revisiting
the work I did on the logfile compression so that I can save a few pennies
(literally, my current costs are \$0.03 / month) and time on analyzing who
visits an unused website. The other thing I've bene wanting to do for some time
is setting up an IRC bouncer so I can lurk in some IRC channels. Perhaps doing
that will help me remember how I did the OpenVPN stuff as well, leading to even
more to write about.

Until next time, however long that may be.
