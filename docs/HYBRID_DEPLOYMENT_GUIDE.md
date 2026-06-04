# Hybrid Production Deployment Guide

This guide details the step-by-step process of deploying the Repair Management System to production for **$0/month** (or utilizing Azure free credits). 

## Infrastructure Stack
* **Frontend:** [Netlify](https://www.netlify.com/) (Free Tier - handles wildcard subdomains `*.atechlabs.it.com` with free auto-SSL).
* **Backend:** [Azure App Service](https://azure.microsoft.com/) (Free F1 Linux plan or Basic B1 plan utilizing $100 credits).
* **Database:** [Aiven for PostgreSQL](https://aiven.io/) (Free tier - fully managed database).

---

## Phase 1: Database Provisioning (Aiven)

1. **Sign Up/Log In:** Go to [Aiven Console](https://console.aiven.io/) and create an account.
2. **Create Service:**
   * Select **PostgreSQL**.
   * Choose the **Free Plan** (available in select regions like AWS US-East or GCP Europe-West).
   * Name your service (e.g., `repair-management-db`).
3. **Get Connection Details:**
   * Once active, click on your service and copy the **Service URI** (connection string).
   * It looks like this: `postgres://avnadmin:password@host:port/defaultdb?sslmode=require`
4. **Convert to .NET Connection String:**
   Translate this URI into the standard .NET connection string format for your backend config:
   ```text
   Host=your-host.aivencloud.com;Port=your-port;Database=defaultdb;Username=avnadmin;Password=your-password;SslMode=Require;Trust Server Certificate=true
   ```

---

## Phase 2: Backend API Deployment (Azure App Service)

1. **Log In to Azure Portal:** Go to the [Azure Portal](https://portal.azure.com/).
2. **Create a Resource Group:**
   * Search for **Resource Groups** -> Click **Create**.
   * Name it `RepairManagement-RG` and choose your region.
3. **Create App Service (Web App):**
   * Search for **App Services** -> Click **Create** -> **Web App**.
   * **Name:** `atechlabs-api` (This defines your URL: `https://atechlabs-api.azurewebsites.net`).
   * **Publish:** Code.
   * **Runtime Stack:** `.NET 8 (LTS)`.
   * **Operating System:** Linux.
   * **Pricing Plan:** Select the **Free F1** tier (or **Basic B1** if using your $100 credits to allow custom domain routing later).
4. **Deploy the Code:**
   * You can deploy via VS Code (using the Azure App Service extension), zip deployment, or set up GitHub Actions CI/CD in the **Deployment Center** tab of your App Service.
5. **Configure Application Settings (Environment Variables):**
   * In the App Service left menu, click **Configuration** (under Settings) -> **Application Settings** tab.
   * Add the following keys (these override settings in `appsettings.json`):
     
     | Name | Value | Description |
     | :--- | :--- | :--- |
     | `ConnectionStrings__DefaultConnection` | *Your Aiven PostgreSQL Connection String* | Connection to database |
     | `Jwt__Key` | *A secure 256-bit password string* | Used to sign access tokens |
     | `Jwt__Issuer` | `repair-management-api` | JWT token issuer |
     | `Jwt__Audience` | `repair-management-app` | JWT token audience |
     | `Jwt__ExpiryMinutes` | `15` | Expiry time |
     | `Stripe__SecretKey` | *Your Stripe Test Secret Key (`sk_test_...`)* | Stripe API Key |
     | `Stripe__WebhookSecret` | *Your Stripe Webhook Signing Secret (`whsec_...`)* | Stripe Webhook Signer |
     | `Stripe__SuccessUrl` | `https://www.atechlabs.it.com/onboarding/success?session_id={CHECKOUT_SESSION_ID}` | Target redirect on Stripe success |

---

## Phase 3: Frontend Deployment (Netlify)

### 1. Configure DNS in Namecheap (Wildcards)
1. Log in to **Namecheap** -> Go to your **Domain List** -> Click **Manage** next to `atechlabs.it.com`.
2. Go to the **Advanced DNS** tab.
3. Add a new record:
   * **Type:** `CNAME Record`
   * **Host:** `*` (Wildcard)
   * **Value:** *Your Netlify Site Subdomain* (e.g. `atechlabs-app.netlify.app`, which you get in the next step).
   * **TTL:** Automatic/1 Min.

---

### 2. Deploy React App to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com/) -> Click **Add new site** -> **Import an existing project**.
2. Link your GitHub account and select your `Repair-Management` repository.
3. Configure build settings:
   * **Base Directory:** `repair-management-app`
   * **Build Command:** `npm run build`
   * **Publish Directory:** `dist`
4. Add **Environment Variables** in the Netlify site configuration settings:
   * Key: `VITE_API_BASE_URL`
   * Value: `https://atechlabs-api.azurewebsites.net` (Your Azure App Service URL).
5. Click **Deploy**.

---

### 3. Bind Wildcard Custom Domain in Netlify

You can bind your Namecheap domain (`atechlabs.it.com`) and wildcard (`*.atechlabs.it.com`) using one of two methods:

#### Method A: Using Netlify DNS (Highly Recommended & Automatic)
This is the easiest path. You hand over DNS management of the domain to Netlify, and Netlify automatically takes care of all wildcard routing and SSL generation.

1. **Add Custom Domain in Netlify:**
   * In your Netlify site dashboard, go to **Site configuration** -> **Domain management** -> **Custom domains** section.
   * Click **Add custom domain**.
   * Enter `atechlabs.it.com` and click **Verify**.
   * When prompted that the domain is already registered, click **Add domain**.
2. **Set up Netlify DNS:**
   * Right after adding the domain, Netlify will show a warning: *"Netlify DNS is not active"*. Click the link that says **Set up Netlify DNS** (or go to **Domains** on your global Netlify sidebar -> click **Add domain**).
   * Click through the screens until Netlify displays a list of **4 Nameservers** (e.g., `dns1.p01.nsone.net`, `dns2.p01.nsone.net`, etc.). Copy these 4 server names.
3. **Configure Namecheap Nameservers:**
   * Log into **Namecheap** and go to your **Domain List**.
   * Click **Manage** next to `atechlabs.it.com`.
   * Under the **Nameservers** section (on the main tab), click the dropdown and change from *Namecheap BasicDNS* to **Custom DNS**.
   * Paste all 4 nameservers from Netlify into the rows.
   * Click the **green checkmark** to save. (Note: DNS propagation can take from 10 minutes to a few hours).
4. **Add Wildcard Subdomain in Netlify:**
   * Go back to your Netlify site's **Domain management** page.
   * Click **Add custom domain** again.
   * Enter `*.atechlabs.it.com` and click **Verify** -> **Add domain**.
   * Since Netlify DNS is active, Netlify will automatically configure the routing and provision a Let's Encrypt SSL certificate covering both the root domain and all wildcards!

---

#### Method B: Keeping Namecheap DNS (External DNS Management)
Use this if you have other subdomains hosted outside of Netlify and do not want to delegate the entire domain's DNS control to Netlify.

1. **Add Custom Domain & Wildcard in Netlify:**
   * In your Netlify site dashboard, go to **Site configuration** -> **Domain management** -> **Custom domains**.
   * Click **Add custom domain**, enter `atechlabs.it.com`, and add it.
   * Click **Add custom domain** again, enter `*.atechlabs.it.com`, and click verify.
2. **Verify Domain Ownership (Required by Netlify for wildcards on External DNS):**
   * Netlify will show a warning next to the wildcard domain: *"Verify domain ownership"*. Click it.
   * Netlify will show you a specific **TXT record key** and **value** that you must add (e.g. host: `_netlify.atechlabs.it.com`, value: `some-unique-string`).
3. **Configure Namecheap Advanced DNS:**
   * Log into **Namecheap** -> **Domain List** -> **Manage** next to `atechlabs.it.com` -> **Advanced DNS** tab.
   * Delete any existing default DNS records (like CNAME or URL redirects for `@` or `www` that point elsewhere).
   * Click **Add New Record** -> **TXT Record**:
     * **Host:** `_netlify`
     * **Value:** *Paste the unique string provided by Netlify*
   * Click **Add New Record** -> **CNAME Record** (for the root domain fallback):
     * **Host:** `www`
     * **Value:** `your-app-subdomain.netlify.app`
   * Click **Add New Record** -> **CNAME Record** (for the wildcard routing):
     * **Host:** `*`
     * **Value:** `your-app-subdomain.netlify.app`
4. **Complete Verification on Netlify:**
   * Go back to Netlify and click **Verify** on your domain ownership popup.
   * Once verified, Netlify will configure the wildcard routing and generate the SSL certificate.

---

## Phase 4: Configure Stripe Dashboard

To enable live payments and provisioning:
1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/).
2. Navigate to **Developers** -> **Webhooks**.
3. Click **Add Endpoint**:
   * **Endpoint URL:** `https://atechlabs-api.azurewebsites.net/api/webhooks/stripe`
   * **Select Events:** Select `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
4. Copy the newly generated **Signing Secret** (`whsec_...`) and update it in your Azure App Service Application settings (`Stripe__WebhookSecret`).

---

## Phase 5: Verification

1. Go to `https://www.atechlabs.it.com/signup` and register a new store (e.g., subdomain: `gold-repair`).
2. Complete the Stripe checkout.
3. Ensure you are redirected to `https://www.atechlabs.it.com/onboarding/success?session_id=...` which will load correctly because of your `vercel.json` / Netlify redirect settings.
4. Verify that you can now log in at your dedicated workspace: `https://gold-repair.atechlabs.it.com/login`.
