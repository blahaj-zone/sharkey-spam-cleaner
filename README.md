# Sharkey Spam Cleaner

[![Build](https://github.com/blahaj-zone/sharkey-spam-cleaner/actions/workflows/node.js.yml/badge.svg)](https://github.com/blahaj-zone/sharkey-spam-cleaner/actions/workflows/node.js.yml)

## Description
Spammers have recently inundated the fediverse by creating many small accounts automatically on
very small and/or unprotected intstances, then proceeding to send messages out with essentially
the same content as DMs to many many people.

This project aims to automatically detect these posts based on a blacklist of known spam messages, and then automatically delete them.

## Features
- Find uploads that match a spam file's signature.
- Suspend the user posting the message.
- Delete ALL posts made EVER by that user.
- Delete ALL files uploaded EVER by that user.
- Repeat.

## Getting Started
To get a local copy up and running follow these simple steps.

The commands below use pnpm, so you should enable it with:

```sh
corepack enable pnpm
```

### Installation
1. Clone the repo
   ```sh
   git clone https://github.com/blahaj-zone/sharkey-spam-cleaner
   ```
2. Install NPM packages
   ```sh
   pnpm install
   ```

### Running the Project
To run this project, follow these steps:

1. Copy the .env.example file to .env.local
   ```sh
   cp .env.example .env.local
   ```

2. Edit the .env.local file to include your instance's database connection string.

3. Command to run the project
   ```sh
   pnpm start
   ```
   Alternatively you can build/run it with:
   ```sh
   pnpm build
   node dist/index.js
   ```

4. Add the md5 of the spam message to the spam list.
   ```sh
   curl localhost:3000/api/add-md5 -
   ```

## UI

There's an optional UI provided if you want to view/add/remove MD5 sums.

To get it running:

1. Initialise the repository:
   ```sh
   cd ui
   pnpm install
   ```

2. Build the site:
   ```sh
   pnpm build
   ```

It will be automatically served when you access the server at http://localhost:3123

### Security Note

If you intend on exposing the server to the public, you must be cautious
to add authentication to the reverse proxy yourself, no authentication
is provided by this project.

Putting it behind a simple reverse proxy and adding authentication will do the trick

#### Example

   The following config can be used with Caddyserver to
   host the site securely behind a password:

   ```Caddyfile
   ssc.mydomain.link {
      basicauth {
         # Generate hash with `caddy hash-password`
         admin $2a$14$DnTQ5S3fY...
      }
      reverse_proxy localhost:3123
   }
   ```

## Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Details/Contact

| channel  | handle
|----------|-----------------------------
| name:    | Kaity A
| repo:    | [sharkey-spam-cleaner](https://github.com/blahaj-zone/sharkey-spam-cleaner)
| matrix:  | `@supakaity:chat.blahaj.zone`
| fedi:    | `@supakaity@blahaj.zone`
| github:  | `supakaity`
