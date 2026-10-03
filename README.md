# Fitcast

Fitcast turns the clothes you already own into a daily outfit that fits the weather and your mood. Built for the AWS Zero to Shipped hackathon.

**Live app:** https://d2ggzmdwta8mfs.cloudfront.net/

## Features
- Weather-aware daily outfit (live data from Open-Meteo)
- Vibe chips: lowkey Sunday, party, brunch, cultural, business casual, or your own
- Hook, a rule-based stylist chat that answers with real photos from your closet
- Closet with always-visible categories and custom categories
- Explore feed built from your own pieces
- Inclusive by design: cultural vibe, coordinated sets, optional head-covering matching

## How it works
A shared rules engine (`src/outfitLogic.js`) picks sets or top-and-bottom pairs, checks color compatibility, adds layers for cold or rainy weather, and prefers pieces you haven't worn recently.

## Built with
React, Open-Meteo API, Amazon S3, Amazon CloudFront, and AWS Amplify Hosting. Deployed with GitHub Copilot connected to AWS.

## What's next
Closets currently live in the browser. The next step is accounts and cloud-synced closets so users can open their closet on any device. `create_tables.py` is groundwork for that (Amazon DynamoDB) and is not used by the live app yet.

## Run locally
npm install
npm start
