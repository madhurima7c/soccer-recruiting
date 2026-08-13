export type MailFolder = {
  id: string
  label: string
  count?: number
}

export type MailMessage = {
  id: string
  from: string
  email: string
  subject: string
  preview: string
  time: string
  unread: boolean
  tag?: string
  folder: string
}

export const mailFolders: MailFolder[] = [
  { id: "inbox", label: "Inbox", count: 847 },
  { id: "ecnl-phoenix", label: "ECNL · Phoenix", count: 214 },
  { id: "ga-atlanta", label: "GA · Atlanta", count: 138 },
  { id: "top-recruits", label: "Top Recruits", count: 96 },
  { id: "visits", label: "Campus Visits", count: 41 },
  { id: "committed", label: "Committed Elsewhere", count: 27 },
  { id: "sent", label: "Sent" },
]

/** Fictional recruit outreach for prototype inbox volume / tagging patterns */
export const mailMessages: MailMessage[] = [
  {
    id: "1",
    from: "Nora Ellison",
    email: "nora.ellison@gmail.com",
    subject: "Interest in your program — ECNL Seattle / All-American",
    preview:
      "Hi Coach — I’m a 2027 GK with ECNL Seattle. Made Best 11 at Phoenix and wanted to introduce myself…",
    time: "9:41 AM",
    unread: true,
    tag: "ECNL",
    folder: "inbox",
  },
  {
    id: "2",
    from: "Jordan Patel (Parent)",
    email: "j.patel@outlook.com",
    subject: "Re: Recruiting inquiry — Ava Patel ’28 striker",
    preview:
      "Coach, following up from GA Atlanta. Ava has unofficial visit interest and Northwestern is also in touch…",
    time: "9:28 AM",
    unread: true,
    tag: "GA",
    folder: "inbox",
  },
  {
    id: "3",
    from: "Sofia Reyes",
    email: "sofia.reyes@icloud.com",
    subject: "Highlight video + transcript (ECNL Bay Area)",
    preview:
      "Attached highlights from last weekend. I’m a CB, 3.9 GPA, targeting Ivy academic fit…",
    time: "9:12 AM",
    unread: true,
    tag: "ECNL",
    folder: "inbox",
  },
  {
    id: "4",
    from: "Coach Delgado · Crossfire",
    email: "cdelgado@crossfirepremier.org",
    subject: "Player recommendation: Elise Navarro (FB)",
    preview:
      "Coach — Elise is one of our top 10s. Family in Silicon Valley, strong academics, looking at Ivy + D1…",
    time: "8:55 AM",
    unread: true,
    tag: "Club",
    folder: "inbox",
  },
  {
    id: "5",
    from: "Harper Quinn",
    email: "harperq27@yahoo.com",
    subject: "National camp call-up — still interested?",
    preview:
      "Just got invited to the regional ID camp. Wanted to check if you’re still watching…",
    time: "8:40 AM",
    unread: true,
    tag: "Camp",
    folder: "inbox",
  },
  {
    id: "6",
    from: "Noah Brooks (Parent)",
    email: "nbrooks@gmail.com",
    subject: "Visit request — April tournament weekend",
    preview:
      "We’d love to schedule a campus visit after ECNL Phoenix. Our daughter plays ST for Solar…",
    time: "8:22 AM",
    unread: true,
    tag: "Visit",
    folder: "inbox",
  },
  {
    id: "7",
    from: "Riley Thompson",
    email: "riley.t@soccermail.com",
    subject: "2027 midfielder — Chicago ECNL",
    preview:
      "Hello Coach, I’m reaching out after your Athlete One listing. Club: Eclipse Select…",
    time: "7:58 AM",
    unread: true,
    tag: "ECNL",
    folder: "inbox",
  },
  {
    id: "8",
    from: "Amelia Soto",
    email: "asoto@gmail.com",
    subject: "All-conference + SAT scores attached",
    preview:
      "Made all-conference this season. Scores attached as requested. Hoping for a call back…",
    time: "7:41 AM",
    unread: true,
    tag: "Academics",
    folder: "inbox",
  },
  {
    id: "9",
    from: "Club Admin · Solar Chelsea",
    email: "admin@solarchelsea.com",
    subject: "Roster update: guest players this weekend",
    preview:
      "FYI — three discovery players will appear on our sheet who may not be in Athlete One yet…",
    time: "Yesterday",
    unread: true,
    tag: "Roster",
    folder: "inbox",
  },
  {
    id: "10",
    from: "Zoe Martinez",
    email: "zoe.m@icloud.com",
    subject: "Re: Interest — committed elsewhere (Michigan)",
    preview:
      "Wanted to thank you for the conversations. I’ve decided to commit to Michigan…",
    time: "Yesterday",
    unread: false,
    tag: "Committed",
    folder: "inbox",
  },
  {
    id: "11",
    from: "Lila Nguyen",
    email: "lilanguyen@gmail.com",
    subject: "ECNL Phoenix — day 2 standout?",
    preview:
      "Coach said to email after the showcase. I’m a GK, 5'10\", distribution focused…",
    time: "Yesterday",
    unread: true,
    tag: "ECNL",
    folder: "inbox",
  },
  {
    id: "12",
    from: "Ethan Park (Parent)",
    email: "epark@outlook.com",
    subject: "Financial aid / scholarship questions",
    preview:
      "Before we visit — can you share how need-based aid works alongside athletic offers?",
    time: "Yesterday",
    unread: true,
    tag: "Aid",
    folder: "inbox",
  },
  {
    id: "13",
    from: "Camila Ruiz",
    email: "cam.ruiz@gmail.com",
    subject: "GA Charlotte · Best XI · looking at Ivy",
    preview:
      "Hi — saw your program on Athlete One. I’ve been tracking Ivy academics + D1 soccer…",
    time: "Yesterday",
    unread: true,
    tag: "GA",
    folder: "inbox",
  },
  {
    id: "14",
    from: "Scout Report Bot",
    email: "noreply@huddle.com",
    subject: "Weekly: 18 new matches tagged for your board",
    preview:
      "Your saved searches returned new clips from ECNL and GA events this week…",
    time: "Sun",
    unread: false,
    tag: "Huddle",
    folder: "inbox",
  },
  {
    id: "15",
    from: "Avery Collins",
    email: "averyc@gmail.com",
    subject: "Intro — LA ECNL / prior campus interest",
    preview:
      "I visited in the fall and wanted to re-open the conversation. Still unsigned…",
    time: "Sun",
    unread: true,
    tag: "Visit",
    folder: "inbox",
  },
  {
    id: "16",
    from: "Mia Johansson",
    email: "mia.j@icloud.com",
    subject: "Highlight reel (updated) — CB ’27",
    preview:
      "Updated tape after Phoenix. First 90 seconds are the aerials you asked about…",
    time: "Sun",
    unread: true,
    tag: "Video",
    folder: "inbox",
  },
  {
    id: "17",
    from: "Derek Walsh (Club Coach)",
    email: "dwalsh@slammersfc.org",
    subject: "Sam Rivera — Phoenix Fall availability",
    preview:
      "Sam is confirmed for all three Phoenix Fall matches this weekend. Happy to connect you with her club trainer…",
    time: "Sat",
    unread: true,
    tag: "Club",
    folder: "inbox",
  },
  {
    id: "18",
    from: "Nina Okonkwo",
    email: "nina.o@gmail.com",
    subject: "Still hoping for a response — emailed twice",
    preview:
      "Hi Coach, I know inboxes get crazy. Just checking you received my film from last month…",
    time: "Sat",
    unread: true,
    tag: "Follow-up",
    folder: "inbox",
  },
  {
    id: "19",
    from: "Tournament Desk · ECNL",
    email: "events@ecnl.com",
    subject: "Schedule change: Flight 3 moved to Field 7",
    preview:
      "Updated match times for staff badges. Please refresh Athlete One…",
    time: "Sat",
    unread: false,
    tag: "Event",
    folder: "inbox",
  },
  {
    id: "20",
    from: "Priya Shah",
    email: "priya.shah@gmail.com",
    subject: "2028 prospect — early interest",
    preview:
      "I’m a rising sophomore but a few club families suggested I introduce myself early…",
    time: "Fri",
    unread: true,
    tag: "Early",
    folder: "inbox",
  },
  {
    id: "21",
    from: "Alex Rivera",
    email: "arivera@gmail.com",
    subject: "Re: Official visit availability?",
    preview:
      "Any April weekends open? Competing with Northwestern’s visit date…",
    time: "Fri",
    unread: true,
    tag: "Visit",
    folder: "inbox",
  },
  {
    id: "22",
    from: "Taylor Kim",
    email: "tkim@yahoo.com",
    subject: "GK — 80% scholarship question",
    preview:
      "Other schools are talking numbers. Curious where you sit before we travel…",
    time: "Fri",
    unread: true,
    tag: "Money",
    folder: "inbox",
  },
  {
    id: "23",
    from: "Samira Haddad",
    email: "samira.h@icloud.com",
    subject: "All-American watchlist update",
    preview:
      "Made the watchlist announcement this morning. Sharing in case it helps the file…",
    time: "Thu",
    unread: true,
    tag: "Camp",
    folder: "inbox",
  },
  {
    id: "24",
    from: "Ben Ortiz (Parent)",
    email: "bortiz@gmail.com",
    subject: "Transcript resend + club change",
    preview:
      "She switched clubs at season end — new team is not on the old ECNL export…",
    time: "Thu",
    unread: true,
    tag: "Roster",
    folder: "inbox",
  },
]
