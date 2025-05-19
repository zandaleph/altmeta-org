---
title: 'A Brief Guide to the AWS CLI and S3'
date: '2020-07-01'
lead: "The world's largest filesystem at your fingertips"
---

This post is a guided walkthrough of what you'll need to do to get started using
AWS S3 with the AWS CLI. By the end you should be able to upload, discover, and
download files with simple command line commands. I'll also talk a bit about
ACLs, or Access Control Lists, which control who can access your files.

One of the first and still best services offered by AWS is S3, the Simple
Storage Service. Over the years it has grown enough additional features that
calling it "Simple" is a bit of a stretch, but for basic usage the adjective
still fits. Loosely, S3 is an infinitely large, never-failing[^1] networked file
storage which supports reads, writes, listing files, and ACLs. It doesn't
understand folders, but some tools (including the AWS CLI) treat forward slash
('/') specially so you can simulate folder support (they call them "prefixes").

To access S3 (and other AWS services), The [AWS CLI] is a surprisingly useful
tool. For S3 it offers familiar operations like copy, move, and list. For other
AWS services, the CLI allows quick tests of various APIs without needing to
setup a whole scripting environment. Because it largely works like any other
command line tool, it can also be used as part of a whole - I've [built
makefiles] and [shell scripts] which used the AWS CLI as a scrappy way to build
small pieces of automation which served me for years.

[aws cli]: https://aws.amazon.com/cli/
[built makefiles]: /weblog/zack/2015/09/finally-makeing-progress-again/
[shell scripts]: /weblog/zack/2013/12/hands-free-operations/

To use AWS, you'll need an account. To get an account, you'll need an email
address and a credit card.  Don't worry too much about the cost of S3 - it's
currently at $0.023 / GB / Month, and that can drop to $0.0125 if you're not
accessing the data very often.

> **WARNING** While individual actions in AWS are usually fractions of pennies,
> it is very easy to spend a ton of money doing nothing, so be careful with your
> AWS account once you've created it.

AWS has a nice [guide on creating a new account] that you should follow if you
need one. There's a lot of nuance you can get into after creating an account -
sub accounts, limited access rights, etc., but don't worry about that if you're
just getting started. Worry about it when you re-read that warning above and
are starting to develop bigger things.

[guide on creating a new account]: https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/

Once you've got an account, the friendliest way to interact with AWS is to use
their web interface, called the [AWS Management Console]. For single-time
operations, like registering a domain name or setting up DNS, the console is
great. You can even use it to browse, upload, and download files in S3. But
realistically, for anything you want to do more than once the AWS CLI is the
first tool which makes automation possible.

[aws management console]: https://console.aws.amazon.com/

You can install the AWS CLI using [their official instructions], or by using the
package manager of your choice. They currently recommend using a docker image,
but I personally think this is overkill for simple usage, so you can ignore
that. Once it is installed, startup your favorite terminal program and try the
following:

[their official instructions]: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html

```sh
aws
```

With luck, you'll get a brief "usage" text. If you instead get an error, you may
need to restart your terminal or edit your `PATH` environment variable to make
sure that the `aws` command is available.

Once the CLI itself is working, you'll want to configure it to use your AWS
account so they know who you are when you send requests. We'll talk about this
more in a bit, but AuthN (Authentication) and AuthZ (Authorization) are taken
very seriously in AWS, and you will have multiple places where you will decide
exactly who can do what, where. For now, just run:

```sh
aws configure
```

and use [their documentation on the quick setup] to find your access and secret
key. Again, they will suggest setting up sub-accounts with minimal access
rights - you do not need to do this when first starting out.

[their documentation on the quick setup]: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html

> **WARNING** this command creates a file on your computer at
> `~/.aws/credentials` which contains everything an attacker would need to use
> your AWS account. Protect this file like you would any financial data, and if
> you are in a particularly vulnerable environment, consider creating a limited
> rights sub-account to use instead.

One thing you'll be able to choose during configuration is AWS region.  The
[list of regions] is huge these days - pick one close to you to cut down on
latency. In the US, prefer higher numbered regions as us-west-1 and us-east-1
are legacy datacenters with older hardware and networks.

[list of regions]: https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints

Once configuration is done, we're on to the fun part - actually using S3.  The
documentation for the [S3 commands in the CLI] is available online. You can also
get the same information using in-terminal help by typing: 

[S3 commands in the CLI]: https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/index.html#

```sh
aws s3 help
```

First you'll need to create an S3 bucket.  Think of this as the web address for
your data - it can only ever be associated with one AWS account, and you can
configure bucket-level ACLs (your only alternative is file-level ACLs).
Bucket names are globally unique, so you can't register the same bucket as
someone else.  The CLI command to create a bucket is:

```sh
aws s3 cb <bucket name>
```

Once you have a bucket, you'll want to upload a file to it.  This is most easily
accomplished by using a copy command.  Let's say you want to upload `hello.jpg`
in the current directory:

```sh
aws s3 cp hello.jpg s3://<bucket name>/hello.jpg
```

This will upload the file to S3 and make it available for you to download later.

At this point, you might be asking - who all has access to this file I just put
_somewhere_ on the internet.  The good news is that the default ACL for new
buckets is private - i.e. only the account which created the bucket can access
anything inside the bucket.  You can change this ACL if you want, or you can set
file level ACLs if certain files are meant to have different visibility.  For
example, if you had instead typed the command:

```sh
aws s3 cp hello.jpg s3://<bucket name>/hello.jpg --acl public-read
```

Then anyone who types `https://s3.amazonaws.com/<bucket name>/hello.jpg` into
their browser can access the file (note: it may not show up in the browser as an
image for reasons left to another day).

To see what files you've uploaded, you can use a list command:

```sh
aws s3 list s3://<bucket name>/
```

I mentioned earlier that S3 doesn't really have folders, but the CLI tries to
fake them by grouping common prefixes at forward slashes.  If you had a few
files uploaded, all prefixed with `images/`, then this list command wouldn't
show all of those files, it would simply have a placeholder of `images/` and you
would need to do a second list command to see what files have that prefix:

```sh
aws s3 list s3://<bucket name>/images/
```

To download files, you use the copy command again, but just reverse the order of
the arguments:

```sh
aws s3 cp s3://<bucket name>/hello.jpg hello.jpg
```

The S3 commands all follow the pattern of source first, destination second when
it comes to positional arguments.  A few other commands you might find useful:

To rename (aka move) a file, you can do:

```sh
aws s3 mv s3://<bucket name>/hello.jpg s3://<bucket name>/goodbye.jpg
```

and to remove a file, you can use:

```sh
aws s3 rm s3://<bucket name>/goodbye.jpg
```

This should give you basic [CRUD operations], which is enough to get started.
AWS's documentation both for the CLI and the overall API is excellent, and a
good place to keep reading if you're interested in learning more about ACLs.

One final gotcha I will call out - while the CLI mimics good unix commands like
`ls`, `cp`, and `rm`, the metadata associated with files on disk is different
from the metadata associated with files in S3.  ACLs are an important piece of
the metadata in S3, and you lose that information using these basic operations.
If you start needing to care about file ACLs, you'll want to build some simple
scripts to store / upload metadata in a secondary file when stored locally.

[CRUD operations]: https://en.wikipedia.org/wiki/Create,_read,_update_and_delete

[^1]:  S3 has had [one major outage] in fifteen years. It was unavailable for
    four hours and lost no customer data. Data in S3 is fundamentally durable -
    they spread it across (a secret number of) servers in an efficiently
    redundant way, and their operational response time to failed storage is low
    enough that it is practically impossible for data to be lost.

    That being said, durability means little if you can't access the data - much
    of the internet was down during this outage, mainly due to a lack of users'
    redundancy across regions (or functional fallback plans when redundancy was
    available.)  I appreciate [Gremlin Inc's writeup] on lessons learned both
    for Amazon and their users as a direct result of this outage.

[one major outage]: https://aws.amazon.com/message/41926/
[Gremlin Inc's writeup]: https://www.gremlin.com/blog/the-2017-amazon-s-3-outage/
