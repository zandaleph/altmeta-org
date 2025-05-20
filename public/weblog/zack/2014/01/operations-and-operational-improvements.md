---
title: 'Operations and Operational Improvements'
date: 2014-01-02
lead: "I have to admit, it's getting better.  It's getting better all the time."
legacyPath: '/weblog/zack/2014/01/operations-and-operational-improvements.html'
---

Well, the website is still running, despite some hiccups. Apparently there is a
lot of demand for t1.micro instances around the end of the year. As you can see
below, they shut down my instance 18 times in the span of 48 hours.

![Graph of CPU Utilization over time for 19
instances.](./unstable-spot-instance.png 'Notice how it just keeps failing.')

The automation discussed last time worked very well. It valiantly brought my
nginx server back online each time I was given a new instance. I can tell this
because I setup email notifications each time my server stops and starts
responding:

![Screenshot of two gmail conversations showing 18 ALARM and OK
notifications](./health-check-notifications.png "It's not spam, really!")

The most frustrating part of this experience was that I wanted to work on adding
features to my website, and instead I had no server to work on some of the time.
Such is the price of underpaying for my hardware, I suppose [^1].

Once everything stabilized, I did do a few things to make my life easier. The
first thing I did was to solidify my SSH host RSA key. By default, when a new
instance starts up it creates a new host RSA key, since you need one in order
for SSH to work at all. This is what the server uses to "prove" it is who it
says it is. Unfortunately, since my instances always have the same ip address,
from the client side it seems like my server has multiple personality disorder.
This results in the following message:

```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@     WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!    @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that the RSA host key has just been changed.
The fingerprint for the RSA key sent by the remote host is
5c:9b:16:56:a6:cd:11:10:3a:cd:1b:a2:91:cd:e5:1c.
Please contact your system administrator.
Add correct host key in /home/user/.ssh/known_hosts to get rid of this message.
Offending key in /home/user/.ssh/known_hosts:1
RSA host key for ras.mydomain.com has changed and you have requested strict checking.
Host key verification failed.
```

To "fix" this, I have to go edit my `~/.ssh/known_hosts` file and remove the
offending line. This is fine, but it takes time and removes some of the security
that SSH is supposed to give me.

If instead I use a consistent host RSA key, then I no longer get this message.
If I still get this message, then someone is probably something nasty (as the
message would suggest). To achieve this, I simply copied the one from my current
host to S3, and then added some code to my startup script to put the stored
version in place when the instance starts up. Here's the relevant code snippet:

```sh
# Load configuration and a known host key for ssh
aws s3 cp s3://org.altmeta.data/spot-1/sshd_config /etc/ssh/sshd_config
aws s3 cp s3://org.altmeta.data/spot-1/ssh_host_rsa_key /etc/ssh/ssh_host_rsa_key
aws s3 cp s3://org.altmeta.data/spot-1/ssh_host_rsa_key.pub /etc/ssh/ssh_host_rsa_key.pub
service sshd force-reload
```

The second thing I did, since I was already playing with SSH, was to change
which port I was listening for SSH connections on. By default this is port 22,
which is how SSH is registered with IANA, the orgnization that manages these
sort of things. Since there is a default port, unsavory people are constantly
sending login attempts to random servers, using databases of known user accounts
and default passwords to gain access. I use a more secure method of logging into
my server, so I'm not particularly vulnerable to these attempts, but it does
generate lots of noise in my logs. By changing the port, I trade a little
inconvenience for much more manageable logs.

At this point, I should point out that changing my SSH port is not making my
server more secure. I have exactly the same vulnerabilities I did before,
including a possible DOS attack from filling up my hard drive with bad login
attempts. If you decide to follow the same strategy, do not do so out of some
sort of misguided attempt to lock down your server.

The next couple of changes were small but valuable. First, I decided to trade
some start up time to update my installed packages, thus benefitting from any
security updates that have been released since my machine image was create. This
was a one-liner in my startup script:

```sh
# Install all security patches
yum -y update
```

Next I installed a simple script in `/etc/profile.d/` to make sure I always had
the `AWS_DEFAULT_REGION` environment variable set. This way, when I use the AWS
command line interface, I don't have to add the `--region` flag to every
command. The script read:

```sh
export AWS_DEFAULT_REGION=us-west-2
```

And the relevant startup script line:

```sh
# Install a profile.d script
aws s3 cp s3://org.altmeta.data/spot-1/aws-default-region.sh /etc/profile.d/aws-default-region.sh
```

Actually, I thought `/etc/profile.d/` was pretty cool. Looking at what was put
there by default, it looks like this is the standard way to install
autocompletion for your command line tools. I saw the AWS CLI lurking in this
directory, among others. One of the things I am thankful for in this endeavor is
learning about where all the magic comes from, one random directory at a time.

For my last change in this batch, I wanted to improve how I claimed my IP
address on startup. Previously, I simply told AWS to associate my given IP
address with my instance. Unfortunately, this does not work if another instance
is already using it, which happens sometimes when I am testing the startup
script. In this case, I have to disassociate the address from the previous
instance before I associate it with this one.

Alas, things are never so easy. I use an `allocation_id` to specify which of my
allocated IP addresses I want to associate with my instance. To disassociate,
however, I need an `association_id`, which uniquely identifies an association
between an allocated IP address and an instance. To get the relevant
`association_id` for a given `allocation_id` I have to make a third call to
describe the `allocation_id`. Here's the relevant part of the startup script:

```sh
# Reclaim our IP address, evicting current user if exists
ALLOC_ID=eipalloc-f04f5b92
ASSOC_ID=`aws ec2 describe-addresses --allocation-ids "$ALLOC_ID" | grep AssociationId | sed -e 's/.*"AssociationId": "\(.*\)".*/\1/'`
if [ -n "$ASSOC_ID" ]; then
  aws ec2 disassociate-address --association-id "$ASSOC_ID"
fi
aws ec2 associate-address --instance-id `curl http://169.254.169.254/latest/meta-data/instance-id` --allocation-id "$ALLOC_ID"
```

The `grep` and `sed` pipeline following the describe-addresses call is a poor
man's JSON parsing. If I had better tools available, I would use them, but it
wasn't important enough yet to install them. The if block simply makes sure my
variable is non-null, so I don't make an unnecessary disassociate call.

While I was testing this code, a strange things happened. Instead of working, I
received the following error message:

```
Unable to locate credentials. You can configure credentials by running "aws configure".
```

The AWS CLI is supposed to get my credentials from instance metadata, but I
guess calls to that endpoint can fail. Since the number of AWS CLI calls I'm
making is only going to go up, I added the following to the beginning of my
startup script:

```sh
# Explicitly get security credentials once, to avoid timeouts
SECURITY_CREDENTAILS=`GET http://169.254.169.254/latest/meta-data/iam/security-credentials/Spot-1/`
export AWS_ACCESS_KEY_ID=`echo "$SECURITY_CREDENTIALS" | grep "AccessKeyId" | sed -e 's/.*"AccessKeyId".*:.*"\(.*\)".*/\1/'`
export AWS_SECRET_ACCESS_KEY=`echo "$SECURITY_CREDENTIALS" | grep "SecretAccessKey" | sed -e 's/.*"SecretAccessKey".*:.*"\(.*\)".*/\1/'`
export AWS_SECURITY_TOKEN=`echo "$SECURITY_CREDENTIALS" | grep "Token" | sed -e 's/.*"Token".*:.* "\(.*\)".*/\1/'`
```

By setting these environment variables, I can supply my credentials to the AWS
CLI without it needing to fetch them from instance metadata each time. After
doing this, I did not see the "Unable to locate credentials" error again.

Well, if you've made it this far, thanks for sticking with me. This batch of
changes got a little larger than I realized, and I wanted to make sure I
documented my reasoning before doing the next thing. I still don't have
comments, so figuring out my email and sending me feedback is greatly
appreciated.

[^1]:

    One of the things I did while I couldn't access my server was figure out
    exactly how much it would cost me to move to a dedicated server. I made some
    pretty sweet graphs in the process, which you can see below. I think I might
    spend a little bit of time making it easier to create these graphs, since I
    found them really useful in making decisions.

    ![Graph of t1.micro instance total cost over time, based on
    contract](./t1-micro-total-cost-by-month.png 'The sharp upward spikes are when
    you pay the upfront cost again')

    ![Graph of t1.micro instance monthly cost over time, based on
    contract](./t1-micro-monthly-cost-by-month.png 'This graph makes it easier to
    compare running costs, I think')
