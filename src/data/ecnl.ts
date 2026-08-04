export type EcnlEvent = {
  id: string
  name: string
  ages: string
  start: string
  end: string
  location: string
  city: string
  tv?: boolean
  highlight?: boolean
}

/** Structured like https://theecnl.com/sports/ecnl-girls/schedule/2025-26 */
export const ecnlEvents: EcnlEvent[] = [
  {
    id: "nj",
    name: "ECNL New Jersey",
    ages: "U11–U14",
    start: "Aug 22 (Fri)",
    end: "Aug 24 (Sun)",
    location: "Somerset, NJ",
    city: "Somerset, NJ",
  },
  {
    id: "stl",
    name: "ECNL St. Louis",
    ages: "U13–U14",
    start: "Sep 12 (Fri)",
    end: "Sep 14 (Sun)",
    location: "St. Louis, MO",
    city: "St. Louis, MO",
  },
  {
    id: "sd",
    name: "ECNL San Diego",
    ages: "U12–U15",
    start: "Oct 11 (Sat)",
    end: "Oct 13 (Mon)",
    location: "Surf Sports Park",
    city: "Del Mar, CA",
  },
  {
    id: "nc-fall",
    name: "ECNL North Carolina Fall",
    ages: "U11–U14",
    start: "Oct 11 (Sat)",
    end: "Oct 13 (Mon)",
    location: "Wilmington, NC",
    city: "Wilmington, NC",
  },
  {
    id: "phx-fall",
    name: "ECNL Phoenix Fall",
    ages: "U16–U18/19",
    start: "Nov 14 (Fri)",
    end: "Nov 16 (Sun)",
    location: "Phoenix, AZ",
    city: "Phoenix, AZ",
    tv: true,
    highlight: true,
  },
  {
    id: "kc",
    name: "ECNL Kansas City",
    ages: "U15–U18/19",
    start: "Dec 6 (Sat)",
    end: "Dec 8 (Mon)",
    location: "Kansas City, MO",
    city: "Kansas City, MO",
    tv: true,
  },
  {
    id: "fl-winter",
    name: "ECNL Florida Winter",
    ages: "U16–U18/19",
    start: "Jan 10 (Sat)",
    end: "Jan 12 (Mon)",
    location: "Lakewood Ranch, FL",
    city: "Lakewood Ranch, FL",
    tv: true,
  },
  {
    id: "tx",
    name: "ECNL Texas",
    ages: "U14–U18/19",
    start: "Feb 14 (Sat)",
    end: "Feb 16 (Mon)",
    location: "Dallas, TX",
    city: "Dallas, TX",
    tv: true,
  },
  {
    id: "fl-spring",
    name: "ECNL Florida Spring",
    ages: "U15–U18/19",
    start: "Feb 27 (Fri)",
    end: "Mar 1 (Sun)",
    location: "Lakewood Ranch, FL",
    city: "Lakewood Ranch, FL",
    tv: true,
  },
  {
    id: "phx-spring",
    name: "ECNL Phoenix Spring",
    ages: "U12–U17",
    start: "Mar 27 (Fri)",
    end: "Mar 29 (Sun)",
    location: "Phoenix, AZ",
    city: "Phoenix, AZ",
    tv: true,
    highlight: true,
  },
  {
    id: "sc",
    name: "ECNL South Carolina",
    ages: "U13–U15",
    start: "May 8 (Fri)",
    end: "May 10 (Sun)",
    location: "Greer, SC",
    city: "Greer, SC",
  },
  {
    id: "intl",
    name: "ECNL International Tournament",
    ages: "Select",
    start: "May 28 (Thu)",
    end: "May 29 (Fri)",
    location: "Liverpool, England",
    city: "Liverpool, England",
  },
  {
    id: "nc-spring",
    name: "ECNL North Carolina Spring",
    ages: "U15–U17",
    start: "May 30 (Sat)",
    end: "Jun 1 (Mon)",
    location: "Greensboro, NC",
    city: "Greensboro, NC",
    tv: true,
  },
  {
    id: "finals-18",
    name: "ECNL Girls National Finals (U18/19)",
    ages: "U18/19",
    start: "Jun 24 (Wed)",
    end: "Jun 27 (Sat)",
    location: "St. Louis, MO",
    city: "St. Louis, MO",
  },
  {
    id: "playoffs",
    name: "ECNL Girls Playoffs & Finals (U13–U17)",
    ages: "U13–U17",
    start: "Jul 11 (Sat)",
    end: "Jul 17 (Fri)",
    location: "Seattle, WA",
    city: "Seattle, WA",
  },
]

export const ecnlNav = [
  "ECNL Girls",
  "Schedule",
  "Teams",
  "Standings",
  "News",
  "Stats",
  "Recruiting",
] as const
