# PDF Files

You'll need to host a directory of the source pdf files on your server's filesystem.

Note that pdf files much match the file naming specified in `./api/src/shared/pdf_library.ts`

# API

- Navigate to ./api
- Run: `yarn install`
- Run: `yarn build; yarn start`
- Add a .env file to the root directory, specifying the pdf file folder. (See `.env.example`)

API runs on port 4002 by default, this can be changed in `./api/env/production.env`

Make note of the address of the API instance, this is the API_URL (ex http://<ip_address>:4002)

It should work?!

# WWW Frontend

- Navigate to ./www
- Set up a .env file with the proper API url from above. See `.env.example`
- Run: `yarn install`
- Run: `yarn start`

I think it will work?!?!

## React router deep links on EC2 deploy

If deploying to Amazon EC2 on an Apache/httpd server, there's some extra steps to make the deep links work. (assumes you've deployed to /var/www/html)

- Under /var/www/html, add an .htaccess file containing the following:

```
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

- Edit httpd.conf: `sudo nano /etc/httpd/conf/httpd.conf`
- Under `<Directory "/var/www/html">`, replace: `AllowOverride None` with: `AllowOverride All`
- Restart httpd: `sudo systemctl restart httpd`
