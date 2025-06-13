---
title: "Adding Bulk Add To My App"
date: "2025-06-12"
lead: "In which I celebrate (and demo) a small feature"
shortname: "mtgbulkadddemo"
---

Finally got back to implementing my Magic collection app rather than working on planning docs today. Thanks to the power of deadlines (upcoming travel), I really needed the streamlined addition interface I've been thinking of to quickly record 1000+ loose cards I have lying around. I did about 300 just typing raw collector numbers into text files before I realized I wanted something a bit more helpful. So I built it.

(I want to include a video here but my Markdown processor needs to learn a new trick first)

Ultimately, what I wanted was a number-pad input where I had separate "enter" keys for normal and foil treatments, so I could just slam in a draft's worth of cards in as few keystrokes as possible. I figured out how to get an input element to display the numberpad I wanted (`inputmode="tel"`), then set up an onkeydown listener for + and \* to perform the insert. The \* is similar to the star show on foil cards, so it made sense in my head. My wife correctly suggested separate buttons, coming soon.

Since I don't have the remote storage implemented yet (the design is finally done, at least), I'm leaning heavily on the export I already built to save the data entry I'm doing. It's working great, and best of all it's finding bugs like the "TODO: escape quotes" I left in my CSV writer (Alesha, Who Laughs at Fate, also laughed at this bug). Other bugs: I really don't support light mode at all yet, honestly I'm not sure I want to but the AI-generated code did so for the background only.

I'm now able to record a card every 5 seconds or so, most of which is spent moving the top card off the stack I'm going through. This is about as fast as I've been able to get using vision-based classifiers from other apps (dragonshield), plus I get no scan failures, so it might be slightly faster. It's also teaching me about where I'm wrong in the data model (why would a card record ever be more than one card?), which reinforces UX driven development for me.

All of this makes me really excited to get the integration with Supabase working so that I don't have to constantly manage exported CSV files and it just works. That's going to be my downtime activity while traveling, and I'm hoping to have it done before I get back. But for now, I've got to put the toys away for a bit and make sure I know where all my passports and chargers are - the boring practicalities of life when traveling.
