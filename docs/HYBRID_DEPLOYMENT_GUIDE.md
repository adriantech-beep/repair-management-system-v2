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

#### 3. Subdomain Configuration (Netlify Manual Management)

> [!WARNING]
> Netlify **does not** support wildcard subdomains (`*.yourdomain.com`) on its Free tier. It requires a paid team plan (Pro or above) to configure wildcard routing and wildcard SSL certificates.
> If you wish to remain on Netlify's free plan, you must manually add each new tenant's subdomain as a **Domain Alias** in the Netlify UI.

#### How to Manually Add a Subdomain Alias on Netlify:
1. Log in to the [Netlify Dashboard](https://app.netlify.com/).
2. Select your React app site.
3. In the left-hand sidebar, navigate to **Site configuration** -> **Domain management**.
4. Scroll down to the **Custom domains** section and click the **Add custom domain** button.
5. Enter your new tenant's subdomain (e.g. `newstore.atechlabs.it.com`) and click **Verify**.
6. When prompted that the domain is already registered, click **Add domain**.
7. Netlify will automatically request and bind a Let's Encrypt SSL certificate for this subdomain.

---

### Alternative: Automated Wildcards via Vercel (100% Free)

If you want to automate tenant onboarding without manually adding subdomains, we recommend migrating your React frontend hosting to **Vercel** (the Hobby plan is 100% free and natively supports wildcard subdomains).

We have already added the [vercel.json](file:///d:/Project-For-Portfolio/Repair-Management/repair-management-app/vercel.json) configuration file to your repository, meaning your React app is ready to deploy on Vercel out of the box.

#### Steps to Set Up Wildcards on Vercel:
1. **Import Project to Vercel:**
   * Go to the [Vercel Dashboard](https://vercel.com/) and import your `Repair-Management` repository.
   * Set the root/base directory to `repair-management-app`.
   * Add the Environment Variable `VITE_API_BASE_URL` with your Azure API URL.
   * Deploy the site.
2. **Add Wildcard Domain in Vercel:**
   * In your Vercel project, go to **Settings** -> **Domains**.
   * Add `*.atechlabs.it.com` (with the asterisk).
   * Vercel will ask you to change your nameservers to Vercel's nameservers at your registrar (Namecheap).
3. **Configure Nameservers in Namecheap:**
   * In Namecheap, update the nameservers for `atechlabs.it.com` to the custom Vercel nameservers provided by Vercel.
   * Once updated, Vercel will automatically route **any** subdomain to your React app and provision SSL dynamically on-the-fly. No manual configuration will be required for new tenants ever again!

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
