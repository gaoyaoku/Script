/*
[rewrite_local]
^https?:\/\/revenuecat\.lakecoloring\.com\/v1\/(subscribers|receipts)\/ url script-response-body https://raw.githubusercontent.com/gaoyaoku/Q/main/Script/lake.js

[mitm]
hostname = revenuecat.lakecoloring.com
 */


let body = JSON.parse($response.body);

body.subscriber.entitlements = {
    "standard": {
        "expires_date": "2024-01-11T11:20:16Z",
        "grace_period_expires_date": null,
        "product_identifier": "com.lake.coloring.sub.all1.promo2.yearly2",
        "purchase_date": "2023-01-11T11:20:16Z"
    }
}

body.subscriber.subscriptions = {
    "com.lake.coloring.sub.all1.promo2.yearly2": {
        "auto_resume_date": null,
        "billing_issues_detected_at": null,
        "expires_date": "2024-01-11T11:20:16Z",
        "grace_period_expires_date": null,
        "is_sandbox": false,
        "original_purchase_date": "2023-01-11T11:20:16Z",
        "ownership_type": "PURCHASED",
        "period_type": "yearly",
        "purchase_date": "2023-01-11T11:20:16Z",
        "refunded_at": null,
        "store": "app_store",
        "unsubscribe_detected_at": null
    }
}

$done({
    body: JSON.stringify(body)
});