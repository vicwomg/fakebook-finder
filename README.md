# PDF Files

You'll need to host a directory of the source pdf files on your server's filesystem.

Note that pdf files much match the file naming specified in `./api/src/shared/pdf_library.ts`

# API

- Navigate to ./api
- Run: `yarn install`
- Run: `yarn build; yarn start`
- Add a .env file to the root directory, specifying the pdf file folder. (See `.env.example`)

API runs on port 4002 by default, this can be changed in `./api/env/production.env`

It should work?!

# WWW Frontend

- Navigate to ./www
- Set up a .env file with the API url in it. See `.env.example`
- Run: `yarn install`
- Run: `yarn start`

I think it will work?!?!
