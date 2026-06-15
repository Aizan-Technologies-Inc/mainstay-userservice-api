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
const navLinks = Array.from(document.querySelectorAll(".section-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const searchInput = document.querySelector("#section-search");
const searchStatus = document.querySelector("#search-status");
const sectionSearchIndex = navLinks
  .map((link) => {
    const id = link.getAttribute("href")?.slice(1);
    const section = id ? document.getElementById(id) : null;

    if (!id || !section) return null;

    return {
      id,
      text: `${link.textContent} ${id.replaceAll("-", " ")} ${section.textContent}`.toLowerCase()
    };
  })
  .filter(Boolean);
let activeSearchTarget = "";

function setActiveNav(id) {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
  });
}

function updateSearch(query) {
  const visibleQuery = query.trim();
  const normalizedQuery = visibleQuery.toLowerCase();

  if (!normalizedQuery) {
    navLinks.forEach((link) => link.classList.remove("is-search-hidden"));
    sections.forEach((section) => section.classList.remove("is-search-hidden"));
    searchStatus?.classList.remove("is-visible");
    if (searchStatus) searchStatus.textContent = "";
    activeSearchTarget = "";
    return;
  }

  const matches = sectionSearchIndex.filter((section) => section.text.includes(normalizedQuery));
  const matchingIds = new Set(matches.map((section) => section.id));

  navLinks.forEach((link) => {
    const id = link.getAttribute("href")?.slice(1);
    link.classList.toggle("is-search-hidden", !matchingIds.has(id));
  });

  sections.forEach((section) => {
    section.classList.toggle("is-search-hidden", !matchingIds.has(section.id));
  });

  if (searchStatus) {
    const resultLabel = matches.length === 1 ? "result" : "results";
    searchStatus.textContent = matches.length
      ? `${matches.length} ${resultLabel} for "${visibleQuery}".`
      : `No sections found for "${visibleQuery}".`;
    searchStatus.classList.add("is-visible");
  }

  if (!matches.length) {
    activeSearchTarget = "";
    return;
  }

  const firstMatch = matches[0].id;
  setActiveNav(firstMatch);

  if (activeSearchTarget === firstMatch) return;

  activeSearchTarget = firstMatch;
  document.getElementById(firstMatch)?.scrollIntoView({ block: "start" });
  history.replaceState(null, "", `#${firstMatch}`);
}

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function setupThemeToggle() {
  const themeToggle = document.querySelector(".theme-toggle");
  const storedTheme = (() => {
    try {
      return localStorage.getItem("aizan-docs-theme");
    } catch {
      return null;
    }
  })();

  const applyTheme = (theme) => {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    themeToggle?.setAttribute("aria-pressed", String(nextTheme === "dark"));
    themeToggle?.setAttribute(
      "title",
      nextTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );

    try {
      localStorage.setItem("aizan-docs-theme", nextTheme);
    } catch {
      // Storage can be unavailable in some browser privacy modes.
    }
  };

  applyTheme(storedTheme === "dark" ? "dark" : "light");

  themeToggle?.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
}

function renderUtilitySections() {
  const content = document.querySelector(".content");
  if (!content || document.getElementById("api-explorer")) return;

  const cards = navLinks
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const section = id ? document.getElementById(id) : null;
      const title = link.textContent.trim();
      const summary = section?.querySelector("p")?.textContent.trim() || "Open this documentation section.";
      const method = endpoints[id]?.method || "DOC";

      return `<a class="explorer-card" href="#${escapeHtml(id)}">
        <span>${escapeHtml(method)}</span>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(summary)}</p>
      </a>`;
    })
    .join("");

  content.insertAdjacentHTML(
    "beforeend",
    `<section class="utility-section" id="api-explorer">
      <h1>API Explorer</h1>
      <p>Use this compact endpoint index to jump directly into the Mainstay UserService API sections.</p>
      <div class="explorer-grid">${cards}</div>
    </section>
    <section class="utility-section" id="changelog">
      <h1>Changelog</h1>
      <ol class="changelog-list">
        <li><strong>Current GitHub Pages build</strong><span>Search filters sections, API Explorer links to each endpoint, and the light/dark theme toggle is active.</span></li>
        <li><strong>UserService migration</strong><span>Recreated the Create User and List Users documentation as a static GitHub Pages site.</span></li>
      </ol>
    </section>`
  );
}

setupThemeToggle();
renderUtilitySections();

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

searchInput?.addEventListener("input", (event) => {
  updateSearch(event.target.value);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
  const activeTag = document.activeElement?.tagName;
  if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;
  event.preventDefault();
  searchInput?.focus();
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
