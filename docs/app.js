const baseUrl = "https://pzjct85e0b.execute-api.ca-central-1.amazonaws.com/Development";

const endpoints = {
  "create-user": {
    method: "POST",
    url: `${baseUrl}/create-users?PaginationToken=abc123`,
    body: `{
  "UserPoolId": "ca-central-1_f6q8dFnE2",
  "Username": "testuser_from_api_002",
  "DesiredDeliveryMediums": [],
  "MessageAction": "SUPPRESS",
  "TemporaryPassword": "AizanT@st1!",
  "UserAttributes": [
    {
      "Name": "name",
      "Value": "John"
    },
    {
      "Name": "phone_number",
      "Value": "+12065551213"
    },
    {
      "Name": "email",
      "Value": "kreva+test3@aizan.com"
    }
  ]
}`
  },
  "list-users": {
    method: "POST",
    url: `${baseUrl}/list-users`,
    body: `{
  "AttributesToGet": [
    "email",
    "sub"
  ],
  "Filter": "\\"email\\"^=\\"kreva\\"",
  "Limit": 3,
  "UserPoolId": "ca-central-1_f6q8dFnE2"
}`
  }
};

function headers() {
  return {
    "x-api-key": "{{api_key_cognito}}",
    "Content-Type": "application/x-amz-json-1.1"
  };
}

function buildSnippet(endpoint, language) {
  const headerEntries = Object.entries(headers());
  if (language === "curl") {
    return [
      `curl --location '${endpoint.url}' \\`,
      ...headerEntries.map(([name, value]) => `  --header '${name}: ${value}' \\`),
      `  --data-raw '${endpoint.body}'`
    ].join("\n");
  }

  if (language === "ruby") {
    return `require "net/http"
require "json"

uri = URI("${endpoint.url}")
request = Net::HTTP::Post.new(uri)
${headerEntries.map(([name, value]) => `request["${name}"] = "${value}"`).join("\n")}
request.body = ${JSON.stringify(endpoint.body)}

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  http.request(request)
end`;
  }

  if (language === "python") {
    return `import requests

response = requests.post(
    "${endpoint.url}",
    headers=${JSON.stringify(headers(), null, 4)},
    data=${JSON.stringify(endpoint.body)}
)`;
  }

  if (language === "php") {
    return `<?php
$ch = curl_init("${endpoint.url}");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ${JSON.stringify(headerEntries.map(([name, value]) => `${name}: ${value}`), null, 2)},
  CURLOPT_POSTFIELDS => ${JSON.stringify(endpoint.body)},
  CURLOPT_RETURNTRANSFER => true
]);
$response = curl_exec($ch);`;
  }

  if (language === "java") {
    return `HttpRequest request = HttpRequest.newBuilder()
  .uri(URI.create("${endpoint.url}"))
${headerEntries.map(([name, value]) => `  .header("${name}", "${value}")`).join("\n")}
  .POST(HttpRequest.BodyPublishers.ofString(${JSON.stringify(endpoint.body)}))
  .build();`;
  }

  if (language === "node") {
    return `const response = await fetch("${endpoint.url}", {
  method: "POST",
  headers: ${JSON.stringify(headers(), null, 2)},
  body: ${JSON.stringify(endpoint.body)}
});`;
  }

  if (language === "go") {
    return `payload := strings.NewReader(${JSON.stringify(endpoint.body)})

req, _ := http.NewRequest("POST", "${endpoint.url}", payload)
${headerEntries.map(([name, value]) => `req.Header.Add("${name}", "${value}")`).join("\n")}`;
  }

  return `using var client = new HttpClient();
using var request = new HttpRequestMessage(HttpMethod.Post, "${endpoint.url}");
${headerEntries.map(([name, value]) => `request.Headers.Add("${name}", "${value}");`).join("\n")}
request.Content = new StringContent(${JSON.stringify(endpoint.body)}, Encoding.UTF8, "application/x-amz-json-1.1");
using var response = await client.SendAsync(request);`;
}

document.querySelector("#section-search").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll(".section-nav a").forEach((link) => {
    link.hidden = query && !link.textContent.toLowerCase().includes(query);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
  const activeTag = document.activeElement?.tagName;
  if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;
  event.preventDefault();
  document.querySelector("#section-search").focus();
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copy);
    if (!target) return;

    const originalLabel = button.textContent;
    try {
      await navigator.clipboard.writeText(target.textContent);
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = originalLabel;
      }, 1100);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
});

function setLanguage(endpointKey, language) {
  const pre = document.querySelector(`#${endpointKey}-request`);
  const endpoint = endpoints[endpointKey];
  if (!pre || !endpoint) return;

  pre.textContent = buildSnippet(endpoint, language);
  document.querySelector(`[data-language-select="${endpointKey}"]`).value = language;

  document.querySelectorAll(`[data-language-tab="${endpointKey}"]`).forEach((button) => {
    button.classList.toggle("is-active", button.dataset.language === language);
  });
}

document.querySelectorAll("[data-language-select]").forEach((select) => {
  select.addEventListener("change", () => {
    setLanguage(select.dataset.languageSelect, select.value);
  });
});

document.querySelectorAll("[data-language-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.languageTab, button.dataset.language);
  });
});

Object.keys(endpoints).forEach((endpointKey) => setLanguage(endpointKey, "curl"));
