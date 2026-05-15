# Password Duel

A 4-player Password word-guessing game with 2 humans and 2 AI bots.

## How It Works

- **Team Alpha**: Human player + Nova (AI bot)
- **Team Beta**: Human player + Byte (AI bot)
- Each human picks their role: **clue-giver** or **guesser**
- The AI partner automatically fills the other role
- Teams alternate giving one-word clues and guessing
- First team to guess the secret word wins the round!

## Scoring

Points decrease as more clues are given: 10 → 8 → 6 → 4 → 2

## Setup

1. Deploy to Netlify (connect this repo)
2. Add environment variable: `ANTHROPIC_API_KEY`
3. Play at your Netlify URL!

## Tech Stack

- Single-file HTML/CSS/JS frontend
- Netlify Functions (serverless) for AI proxy
- Claude API (Sonnet 4) for AI clues and guesses
