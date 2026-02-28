> ## Documentation Index
>
> Fetch the complete documentation index at: https://docs.brightdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# LinkedIn

[The LinkedIn API](https://brightdata.com/products/web-scraper/linkedin) Suite offers multiple types of APIs, each designed for specific data collection needs from LinkedIn. Below is an overview of how these APIs connect and interact, based on the available features:

<CardGroup cols="1">
  <Card title="Profiles API" icon="user" href="/api-reference/web-scraper-api/social-media-apis/linkedin/profiles">
    The [LinkedIn Profiles API](https://brightdata.com/products/web-scraper/linkedin/profiles) allows users to collect profile details based on a single input: profile URL.

    **Discovery functionality**

    * Discover LinkedIn profiles by names

    **Interesting columns**

    * `name`
    * `country_code`
    * `current_company`
    * `about`

  </Card>

  <Card title="Posts API" icon="images" href="/api-reference/web-scraper-api/social-media-apis/linkedin/posts">
    The [LinkedIn Posts API](https://brightdata.com/products/web-scraper/linkedin/post) allows users to collect multiple posts based on a single input URL.

    **Discovery functionality**

    * Direct URL of the LinkedIn profile
    * Direct URL of user’s articles
    * Direct URL of the company

    **Interesting columns**

    * `url`
    * `title`
    * `hashtags`
    * `num_likes`

  </Card>

  <Card title="Job Listings Information API" icon="briefcase" href="/api-reference/web-scraper-api/social-media-apis/linkedin/jobs">
    The [LinkedIn Jobs API](https://brightdata.com/products/web-scraper/linkedin/jobs) allows users to collect job details based on a single input URL.

    **Discovery functionality**

    * Direct URL of the search
    * Discover by keywords

    **Interesting columns**

    * `job_title`
    * `company_name`
    * `job_location`
    * `job_seniority_level`

  </Card>

  <Card title="Companies Information API" icon="building" href="/api-reference/web-scraper-api/social-media-apis/linkedin/companies">
    The [LinkedIn Companies API](https://brightdata.com/products/web-scraper/linkedin/company) allows users to collect company information by using its URL.

    **Discovery functionality**

    * N/A

    **Interesting columns**

    * `name`
    * `country_code`
    * `followers`
    * `employees_in_linkedin`

  </Card>
</CardGroup>

The suite of APIs is designed to offer flexibility for targeted data collection, allowing users to input specific URLs to gather detailed post, profile, job, and company data either in bulk or with precise filtering options.
