---
title: Centralized SMS API
description: Unified SMS API and admin dashboard for sending single, bulk, OTP, and scheduled messages across multiple clients.
tags: [Laravel, Redis]
featured: true
order: 1
company: Pramix IT
---

The company I worked with manages many clients who need to send SMS messages to their users. At the time, there was no centralized or robust system for sending and managing SMS messages; each project had its own SMS provider integration, set up separately. To address this, we built a Centralized SMS API along with an admin dashboard, creating a unified platform that makes SMS management more efficient, reliable, and easier to maintain.

## Features

- /single endpoint: Send a message to a single recipient.
- /bulk endpoint: Send a message to multiple recipients at the same time.
- /otp endpoint: Send one-time password codes.
- Scheduled messages: Schedule SMS messages to be sent at a specific date and time.
- Delivery status callback: Provides SMS delivery status, remaining SMS count, and used SMS count to a specified endpoint.
- API authentication: Secured using Sanctum-based authentication for all API routes.
- Admin dashboard: Monitor and manage clients, packages, and services; view SMS logs; and perform administrative tasks.
- Report generation: Generate reports for billing and other administrative purposes.


