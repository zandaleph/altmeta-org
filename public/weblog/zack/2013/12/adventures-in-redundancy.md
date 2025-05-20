---
title: 'Adventures in Redundancy'
date: '2013-12-22'
lead: 'Watch as I spend a lot of effort going nowhere.'
legacyPath: '/weblog/zack/2013/12/adventures-in-redundancy.html'
---

Well, [altmeta.org](/) has only been up for two days, and I've already upgraded
the hosting. As I briefly mentioned [in my last weblog post], I was running as a
completely static website out of S3. There are a lot of cool things that you can
do with such a website, but to get anything flashy you have to write a lot of
javascript and use a hosted datastore. This did not sound like my current idea
of fun.

[in my last weblog post]: /weblog/zack/2013/12/broken-computer-new-website/

To do anything other than static, however, I would need a server. Because I was
already running on the AWS infrastructure, I looked to their [spot instances]
for my solution. For $0.004 / hour, or about $3 / month, I could have a t1.micro
server and do whatever I wanted with it.

[spot instances]: https://aws.amazon.com/ec2/spot-instances/

A few button clicks later [^1] I had a running instance and console access. By
itself, it did nothing other than let me run commands. Therefore, the next step
was setting up a webserver. I settled on [nginx] because it appeared easy to
[install] and [set up]. I was not dissapointed. To install [^2], all I had to do
was:

[nginx]: http://nginx.org/
[install]: http://nginx.org/en/linux_packages.html
[set up]: http://nginx.org/en/docs/beginners_guide.html

```sh
sudo yum install nginx
```

To start the server, I ran the following command:

```sh
sudo service nginx start
```

The way the nginx server came configured, it was just serving static content out
of the `/usr/share/nginx/html/` directory. This directory was pretty boring,
containing only a sample index.html page and some error pages. At this point, I
could have just moved my static content into that directory and changed my DNS
entry, but there was a slight problem.

Earlier, when I decided to use spot instances, I accepted a certain amount of
risk. The idea behind spot instances is that AWS has a bunch of spare capacity
lying around, and they'll let you use it for a discount if you're okay with them
turning off your server at any time. You can guard against this by offering to
pay more, but then you're competing against other users of spot instances, and
eventually you will lose. At some unknowable point in the future my server is
going to get turned off.

As it turns out, this is no different from any other server. There's a reason
that people boast about 99.99% uptime and not 100% - eventually, hardware fails.
The way most people get around this is by having redundant servers which all do
the same thing. That way, when something fails, they can just stop sending
requests to that machine, and to the outside world everything looks totally
normal [^3].

To solve my single point of failure probelm, I decided to follow a similar
strategy. When my server is up and running, it can handle all the requests. When
it isn't, I can fall back to the static S3 hosting I had before. This is
possible because of [the dns failover feature of Route 53].

[the dns failover feature of route 53]: http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html

I opted to use simple health-check based failover, and instructed Route 53 to
check my primary server for `/ping` to assess service health. If that doesn't
respond, Route 53 simply starts telling people to go to S3 instead of my IP
address until it starts responding again. As an added bonus, I set up a monitor
to email me when this happens. All of this functionality came for free as extra
features of the DNS hosting I had already paid for (at \$0.50 / month).

The only thing left to do was make sure that my webserver and S3 stayed in sync,
so that I didn't lose static content in the event of a failure. For now, I
decided that I would simply forward all requests received by my webserver to S3,
thus only needing to maintain one copy of the files. The nginx configuration for
this is below: [^4].

```nginx
http { # some logging configuration

    upstream altmeta-s3 {
        server altmeta.org.s3-website-us-west-2.amazonaws.com:80;
    }

    server {
        listen       80;
        server_name  altmeta.org;
        root   /usr/share/nginx/html;
        index  index.html index.htm;

        location / {
             proxy_pass  http://altmeta-s3;
             proxy_redirect off;
             proxy_buffering off;
             proxy_set_header Host altmeta.org; # needed for S3
        }

        # don't forward /ping
        location = /ping {
             default_type text/plain;
        }
    }

}
```

This way, the only file I need to have served statically from my host is
`/ping`. There's probably a way I can do this without even that file, but I'm
still learning nginx and couldn't figure it out quickly. After I changed the
config, I simply had to tell nginx to reload the config with:

```sh
sudo service nginx reload
```

At this point, if my instance goes down, I lose two files (the modified
`nginx.conf` and the `/ping` file). I can probably write a simple script to do
this for me if the host goes down more than once, but for now I'm happy to do
that by hand.

So, what have I gained for all this trouble, other than \$3 / month more in
hardware costs? At this point, the world is my oyster. I can run any web
framework I want on the same host as my webserver for no additional cost. I can
keep this static backup website strategy if I want, or I can abandon it when it
no longer makes sense. I also can do other stuff that needs a persistent server,
like running an IRC bouncer or email server. All of which sounds like lots of
fun.

There's still no comment box, so if you have feedback for me you'll still have
to discover my email address and send it to me the "old fashioned" way. Thanks
for reading.

[^1]:

    There were actually a lot of clicks, but only because I decided to also setup
    a VPC at the same time, and [that stuff is complicated].

[that stuff is complicated]: http://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_Introduction.html

[^2]:

    It is important to note here that I'm running the Amazon Linux image, which is
    based on Red Hat / CentOS and not Debian / Ubuntu. You should read the nginx
    documentation if this or other commands don't work.

[^3]:

    In-flight requests to the machine that failed will still fail, but refreshing
    the page will make the problem go away, so most people just assume they had a
    bad internet connection.

[^4]:

    I am indebted to [this post from nixCraft] for bootstrapping my nginx proxy
    configuration.

[this post from nixcraft]: http://www.cyberciti.biz/tips/using-nginx-as-reverse-proxy.html
