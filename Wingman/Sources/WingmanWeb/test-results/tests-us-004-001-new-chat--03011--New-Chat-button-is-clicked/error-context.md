# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Sign In" [level=1] [ref=e5]
      - paragraph [ref=e6]: Welcome back to Wingman
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Email Address *
        - textbox "Email Address *" [ref=e10]:
          - /placeholder: Enter your email
      - generic [ref=e11]:
        - generic [ref=e12]: Password *
        - textbox "Password *" [ref=e13]:
          - /placeholder: Enter your password
      - generic [ref=e14]:
        - generic [ref=e15]:
          - checkbox "Remember me" [ref=e16]
          - generic [ref=e17]: Remember me
        - link "Forgot your password?" [ref=e19] [cursor=pointer]:
          - /url: /forgot-password
      - button "Sign In" [ref=e21]
      - paragraph [ref=e23]:
        - text: Don't have an account?
        - link "Create one" [ref=e24] [cursor=pointer]:
          - /url: /register
  - button "Open Next.js Dev Tools" [ref=e30] [cursor=pointer]:
    - img [ref=e31]
  - alert [ref=e34]
```