@echo off
cd /d C:\ai-resume-builder
node --env-file=.env.local scripts/generate-post-pool.mjs >> scripts\poster.log 2>&1
node --env-file=.env.local scripts/bluesky-post.mjs >> scripts\poster.log 2>&1
