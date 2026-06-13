// ATS-friendly resume template
// Library: basic-resume 0.1.0 (vendored locally, no external package fetch).
// Data sections are injected as Typst arrays of named-content dicts, e.g.:
//   ((institution: "...", location: "...", ...), (...), ...)
// and iterated with `#for` blocks.

#let resume(
  author: "",
  location: "",
  email: "",
  github: "",
  linkedin: "",
  phone: "",
  personal-site: "",
  accent-color: "#000000",
  body,
) = {

  set document(author: author, title: author)

  set text(
    font: "New Computer Modern",
    size: 10pt,
    lang: "en",
    ligatures: false,
  )

  set page(
    margin: (0.5in),
    "us-letter",
  )

  show link: underline

  show heading.where(level: 2): it => [
    #pad(top: 0pt, bottom: -10pt, [#smallcaps(it.body)])
    #line(length: 100%, stroke: 1pt)
  ]

  show heading: set text(
    fill: rgb(accent-color),
  )

  show link: set text(
    fill: rgb(accent-color),
  )

  show heading.where(level: 1): it => [
    #set align(left)
    #set text(
      weight: 700,
      size: 20pt,
    )
    #it.body
  ]

  [= #(author)]

  pad(
    top: 0.25em,
    align(left)[
      #(
        phone,
        location,
        link("mailto:" + email)[#email],
        link("https://" + github)[#github],
        link("https://" + linkedin)[#linkedin],
        link("https://" + personal-site)[#personal-site],
      ).join("  |  ")
    ],
  )

  set par(justify: true)

  body
}

#let generic-two-by-two(
  top-left: "",
  top-right: "",
  bottom-left: "",
  bottom-right: "",
) = {
  pad[
    #top-left #h(1fr) #top-right \
    #bottom-left #h(1fr) #bottom-right
  ]
}

#let generic-one-by-two(
  left: "",
  right: "",
) = {
  pad[
    #left #h(1fr) #right
  ]
}

#let dates-helper(
  start-date: "",
  end-date: "",
) = {
  if start-date == "" and end-date == "" {
    ""
  } else if end-date == "" or end-date == "Present" {
    start-date
  } else if start-date == "" {
    end-date
  } else {
    start-date + " " + $dash.em$ + " " + end-date
  }
}

#let edu(
  institution: "",
  dates: "",
  degree: "",
  gpa: "",
  location: "",
) = {
  generic-two-by-two(
    top-left: strong(institution),
    top-right: location,
    bottom-left: emph(degree),
    bottom-right: emph(dates),
  )
}

#let work(
  title: "",
  dates: "",
  company: "",
  location: "",
) = {
  generic-two-by-two(
    top-left: strong(title),
    top-right: dates,
    bottom-left: company,
    bottom-right: emph(location),
  )
}

#let project(
  role: "",
  name: "",
  url: "",
  dates: "",
) = {
  pad[
    *#role*, #name (#link("https://" + url)[#url]) #h(1fr) #dates
  ]
}

#let extracurriculars(
  activity: "",
  dates: "",
) = {
  generic-one-by-two(
    left: strong(activity),
    right: dates,
  )
}

// ----- Profile dict (injected) -----
// `{{profile}}` is replaced with a Typst dictionary literal e.g.
//   (name: "Jane", email: "j@x.com", github: "github.com/jane", ...)
// We bind it to a local variable so the show rule below can pick fields
// out of it.
#let data = {{profile}}
#show: resume.with(
  author: data.at("name", default: ""),
  location: data.at("location", default: ""),
  email: data.at("email", default: ""),
  github: data.at("github", default: ""),
  linkedin: data.at("linkedin", default: ""),
  phone: data.at("phone", default: ""),
  personal-site: data.at("personal-site", default: ""),
  accent-color: "#26428b",
)

== Education
#for item in {{education}} [
  #let end-ed = if item.isCurrent { "Present" } else { item.endDate }
  #edu(
    institution: item.institution,
    location: item.location,
    degree: item.degree,
    gpa: item.result,
    dates: dates-helper(start-date: item.startDate, end-date: end-ed),
  )
  #for r in item.responsibilities [
    - #r.text
  ]
]

== Work Experience
#for item in {{experience}} [
  #let end-ex = if item.isCurrent { "Present" } else { item.endDate }
  #work(
    title: item.position,
    dates: dates-helper(start-date: item.startDate, end-date: end-ex),
    company: item.company,
    location: item.location,
  )
  #for r in item.responsibilities [
    - #r.text
  ]
]

== Projects
#for item in {{project}} [
  #let end-pj = if item.isCurrent { "Present" } else { item.endDate }
  #project(
    role: item.name,
    name: item.stack,
    url: item.link,
    dates: dates-helper(start-date: item.startDate, end-date: end-pj),
  )
  #for r in item.responsibilities [
    - #r.text
  ]
]

== Extracurricular Activities
#for item in {{achievement}} [
  #extracurriculars(
    activity: item.competition,
    dates: item.date,
  )
  #for r in item.responsibilities [
    - #r.text
  ]
]

== Skills
#for cat in {{skill}} [
  *#cat.title*: #(cat.skills.map(s => s.name).join(", "))
]
