Example 1 - small expansion (manual -> enhanced)

Manual input:
- id: TC-200
- title: Login and view account
- preconditions: User registered
- steps: 1) Open Login 2) Enter credentials 3) Click Login 4) Verify dashboard

Enhanced output (summary):
- 1 navigate to /login (assert login form visible)
- 2 fill username
- 3 fill password
- 4 click login
- 5 wait for navigation
- 6 assert account balance visible
- 7 assert welcome message contains user name

Each enhanced step includes sources and confidence. Use this style in produced JSON.
