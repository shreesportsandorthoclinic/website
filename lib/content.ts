import { CLINIC_DAYS_LABEL, CLINIC_HOURS_LABEL } from "./schedule";

export const clinic = {
  name: "Shree Sports & Ortho Clinic",
  shortName: "Shree Sports & Ortho",
  tagline: "Orthopaedics · Sports Injury · Rehab",
  motto: "Rebuild · Recover · Return Stronger",
  addressLines: [
    "Neeladri Layout, Doddathoguru",
    "Electronic City Phase-1",
    "Bengaluru 560100",
  ],
  locality: "Electronic City Phase-1 · Bengaluru",
  phone: "7337705905",
  whatsapp: "8128105905",
  email: "shreesportsandorthoclinic@gmail.com",
  hours: {
    /* Derived from CLINIC_WINDOWS in lib/schedule.ts so the copy on every
       page and the bookable slot grid can never drift apart. */
    days: CLINIC_DAYS_LABEL,
    clinic: CLINIC_HOURS_LABEL,
    /** Ready-made line for anywhere that needs days + hours in one string. */
    clinicLine: `${CLINIC_DAYS_LABEL} ${CLINIC_HOURS_LABEL.replace(" · ", ", ")}`,
    manipal: "14:00–19:00",
    manipalLabel: "Manipal hospital, 360 degree business park ecity",
  },
  doctor: {
    name: "Dr. Neel",
    fullName: "Dr. Nilkumar H. Zalavadia",
    title: "Orthopaedic Surgeon",
  },
};

/* Dr. Neel started practising in 2013, so "years of experience" is
   counted from there rather than hand-updated each year. */
const DOCTOR_START_YEAR = 2013;
export function experienceYears(): number {
  return new Date().getFullYear() - DOCTOR_START_YEAR;
}

/* Single source of truth for Dr. Neel's credentials — the About page
   renders the full list, and the home page's "Meet the doctor" teaser
   pulls the short version from the same source rather than keeping its
   own copy that could drift out of sync. A function rather than a plain
   array so "Experience" is computed fresh from today's date on every
   call, instead of being frozen at whatever year the module first
   loaded. */
export function getDoctorFacts() {
  return [
    { term: "Qualification", value: "MBBS, DNB (Orthopaedics)", tbc: false },
    { term: "Registration", value: "KMC 174755", tbc: false },
    { term: "Experience", value: `${experienceYears()}+ years`, tbc: false },
    { term: "Languages", value: "English, Hindi, Kannada, Gujarati", tbc: false },
    {
      term: "Specialisation & interests",
      value:
        "Robotic joint replacement · Arthroscopic (key-hole) surgery of the knee and shoulder · Ligament reconstruction",
      tbc: false,
    },
    {
      term: "Procedures",
      value: "ACL, PCL and meniscus repair · Rotator cuff and SLAP repair",
      tbc: false,
    },
    { term: "Memberships", value: "ISAKOS · IOA · IAS", tbc: false },
  ];
}
export function getDoctorFactsHome() {
  return getDoctorFacts().slice(0, 4);
}

/* ── legal / business identity ───────────────────────────────────────
   Backs the footer and the policy pages. Everything still in brackets
   must be filled in, and the whole set of policy pages reviewed by the
   clinic's own advocate before this site goes live — these are drafting
   placeholders, not legal advice. Complaints/data requests go to the
   clinic's own email (clinic.email) rather than a separate named
   Grievance Officer, since the clinic does not have one appointed. */
export const legal = {
  legalEntityName: "Shree Sports and Ortho Clinic",
  registrationNumber: "[ Clinical establishment registration number ]",
  effectiveDate: "8 September 2026",
  dataRetentionPeriod: "1 year",
};

/* Verified third-party listings — the only places reviews/ratings are
   sourced from. Do not add clinic-authored review text anywhere. */
export const profiles = {
  googleMaps: "https://maps.app.goo.gl/2antfoRNCpSq4eaw9",
  justdial: "https://jsdl.in/DT-15G1BM2E12T",
  practo: "https://www.practo.com/bangalore/clinic/shree-sports-and-ortho-clinic-electronics-city",
};

/* How appointments are actually run, so the site states one consistent
   rule instead of guessing at it in several places. */
export const appointmentPolicy = {
  consultationMinutes: 15,
  graceMinutes: 5,
  note: "Booked appointments are always seen ahead of walk-ins. If you arrive more than 5 minutes after your appointment time, the next patient may be taken ahead of you and your appointment may be marked as a no-show.",
};

export type Photo = { src: string; alt: string };

export const photos = {
  doctor: {
    src: "/images/neel.jpg",
    alt: "Dr. Neel, orthopaedic surgeon, at Shree Sports & Ortho Clinic",
  },
  waiting1: { src: "/images/waiting-1.avif", alt: "Waiting area at Shree Sports & Ortho Clinic" },
  waiting2: { src: "/images/waiting-2.avif", alt: "Clinic waiting area" },
  consultDesk: {
    src: "/images/consult-desk.avif",
    alt: "Consultation desk with anatomical spine and pelvis models",
  },
  consultRoom: { src: "/images/consult-room.avif", alt: "Consultation room" },
  lounge: { src: "/images/lounge.avif", alt: "Clinic waiting lounge" },
  reception: { src: "/images/reception.avif", alt: "Reception desk" },
  imagingRoom: { src: "/images/imaging-room.avif", alt: "Imaging room with X-ray equipment" },
  imaging2: { src: "/images/imaging-2.avif", alt: "Imaging equipment" },
  exterior: {
    src: "/images/exterior.png",
    alt: "Street-level view of the Shree Sports & Ortho Clinic building and signage",
  },
} satisfies Record<string, Photo>;

/* ── home ─────────────────────────────────────────────────────────── */

export const complaints = [
  { num: "01", title: "Knee pain", blurb: "Pain while walking, climbing stairs or exercising.", key: "knee" },
  { num: "02", title: "Shoulder pain", blurb: "Pain while lifting, reaching or sleeping.", key: "shoulder" },
  { num: "03", title: "Back & neck pain", blurb: "Stiffness, discomfort and movement-related pain.", key: "back" },
  { num: "04", title: "Sports injuries", blurb: "Gym, running, football, cricket, badminton and more.", key: "sports" },
  { num: "05", title: "Foot & ankle", blurb: "Pain, swelling or difficulty walking.", key: "foot" },
  { num: "06", title: "Work-related pain", blurb: "Neck, back, wrist and posture-related problems.", key: "work" },
];

export const approach = [
  {
    num: "01",
    title: "Understand",
    body: "Understand what is causing the problem — history, examination and imaging where needed.",
  },
  {
    num: "02",
    title: "Treat",
    body: "Agree on a treatment plan that fits the diagnosis, your work and your goals.",
  },
  {
    num: "03",
    title: "Rebuild",
    body: "Restore movement, strength and function through structured rehabilitation.",
  },
  {
    num: "04",
    title: "Return stronger",
    body: "Return to everyday life, work or sport with a plan for staying there.",
  },
];

const conditionKeyFor: Record<string, string> = {
  Knee: "knee",
  Shoulder: "shoulder",
  "Back & Spine": "back",
  "Sports Injuries": "sports",
};

export const conditionList = [
  "Knee",
  "Shoulder",
  "Back & Spine",
  "Hip",
  "Foot & Ankle",
  "Wrist & Hand",
  "Elbow",
  "Sports Injuries",
  "Arthritis",
  "Fractures",
  "Muscle & Tendon",
].map((name) => ({ name, key: conditionKeyFor[name] ?? "knee" }));

export const sportsList = [
  { name: "Gym", note: "Shoulder, knee, lower back" },
  { name: "Running", note: "Knee, shin, Achilles" },
  { name: "Football", note: "ACL, ankle, hamstring" },
  { name: "Cricket", note: "Shoulder, back, side strain" },
  { name: "Badminton", note: "Ankle, knee, shoulder" },
  { name: "Cycling", note: "Knee, neck, wrist" },
  { name: "Trekking", note: "Ankle, knee, foot" },
];

export const workTopics = [
  { name: "Long commutes", tag: "Lower back" },
  { name: "Prolonged sitting", tag: "Hips, back" },
  { name: "Laptop at desk height", tag: "Neck" },
  { name: "Mouse & keyboard load", tag: "Wrist" },
  { name: "Standing desks, badly set", tag: "Feet, knees" },
  { name: "Weekend-only exercise", tag: "Everything" },
];

/* ── sports medicine ──────────────────────────────────────────────── */

export const sportsDetail = [
  {
    name: "Gym",
    injuries:
      "Shoulder impingement from pressing volume, lower back pain from deadlifts and squats, knee pain from load progression.",
    ret: "Usually modified training rather than a break — change the movement, keep the habit.",
  },
  {
    name: "Running",
    injuries: "Runner’s knee, shin pain, Achilles and calf problems, plantar heel pain.",
    ret: "Graded return by distance and surface, with strength work alongside.",
  },
  {
    name: "Football",
    injuries: "ACL and other ligament injuries, ankle sprains, hamstring strains.",
    ret: "Criteria-based: straight-line running, then change of direction, then contact.",
  },
  {
    name: "Cricket",
    injuries: "Shoulder pain in throwing and bowling, lower back stress in fast bowlers, side strains.",
    ret: "Staged bowling or throwing loads rather than a single clearance date.",
  },
  {
    name: "Badminton",
    injuries: "Ankle sprains from lunging, knee pain, shoulder overload from overhead strokes.",
    ret: "Court movement drills before match play.",
  },
  {
    name: "Cycling",
    injuries: "Anterior knee pain, neck and upper back pain, wrist numbness.",
    ret: "Often resolved by fit changes plus targeted strengthening.",
  },
  {
    name: "Trekking",
    injuries: "Ankle sprains, knee pain on descent, foot pain and blistering.",
    ret: "Load-carrying and downhill tolerance built before the trip, not on it.",
  },
];

/* ── work & everyday life ─────────────────────────────────────────── */

export const workDetail = [
  {
    name: "Neck pain by evening",
    body: "Almost always a laptop below eye level plus hours without a position change. It builds through the day and eases overnight.",
  },
  {
    name: "Lower back pain after the commute",
    body: "Sustained flexed sitting on a two-wheeler or in traffic, then straight into a desk chair for eight hours.",
  },
  {
    name: "Wrist and thumb pain",
    body: "Mouse and phone load, usually with a wrist resting on a hard edge. Splinting alone rarely fixes it.",
  },
  {
    name: "Headaches from the base of the skull",
    body: "Frequently related to neck muscle load rather than to the head itself.",
  },
  {
    name: "Shoulder tension that will not settle",
    body: "Desk height and armrest position matter more than stretching does.",
  },
  {
    name: "Pain that vanishes on holiday",
    body: "A useful clue. It points at the daily load rather than at damage.",
  },
];

export const workChanges = [
  "Raise the laptop and use a separate keyboard",
  "Change position every 30–40 minutes, however briefly",
  "Set chair height so feet are supported and forearms are level",
  "Build some strength work into the week, not only on weekends",
  "Break up long commutes where the route allows",
];

/* ── conditions ───────────────────────────────────────────────────── */

export type Faq = { q: string; a: string };

export type Condition = {
  key: string;
  name: string;
  region: string;
  lede: string;
  image: Photo;
  what: string;
  symptoms: string[];
  causes: string[];
  seek: string[];
  evaluated: string[];
  options: string[];
  recovery: string;
  faqs: Faq[];
};

export const conditions: Record<string, Condition> = {
  knee: {
    key: "knee",
    name: "Knee pain",
    region: "Knee",
    lede: "Pain at the front, inside or back of the knee — while walking, climbing stairs, squatting or after activity.",
    image: {
      src: photos.consultDesk.src,
      alt: "Anatomical knee and pelvis models on the consultation desk",
    },
    what: "Knee pain is a symptom, not a diagnosis. It can come from the joint surfaces, the ligaments, the menisci, the tendons around the kneecap, or from load and strength problems further up in the hip. What matters is which of these applies to you, and that is what an examination is for.",
    symptoms: [
      "Pain climbing or descending stairs",
      "Pain after sitting for a long time",
      "Swelling after activity",
      "Giving way or a feeling of instability",
      "Clicking, catching or locking",
      "Difficulty kneeling or squatting",
    ],
    causes: [
      "Overload from a sudden increase in running or gym volume",
      "Twisting injuries during sport",
      "Meniscus and cartilage injury",
      "Ligament injury including ACL and PCL tears",
      "Osteoarthritis and age-related joint change",
      "Weakness in the hip and thigh muscles",
    ],
    seek: [
      "You cannot put weight through the leg",
      "The knee is hot, red or swollen quickly after injury",
      "The knee gives way or locks",
      "Pain has not settled after two weeks of rest and activity change",
      "You heard or felt a pop at the time of injury",
    ],
    evaluated: [
      "A history of how the pain started and what it stops you doing",
      "Physical examination of the knee, hip and gait",
      "X-ray where a bony cause is suspected",
      "MRI where a soft-tissue injury is suspected",
      "Referral for further imaging or opinion where appropriate",
    ],
    options: [
      "Activity and load modification",
      "Physiotherapy and strengthening",
      "Pain management as advised",
      "Joint injection in selected cases",
      "Arthroscopic surgery in selected cases",
      "Knee replacement surgery for advanced arthritis",
    ],
    recovery:
      "Recovery depends entirely on the diagnosis — some knee pain settles within weeks with load changes and strengthening, while a ligament reconstruction is a staged programme over several months. Any timeline you are given should be specific to you, not to a general average.",
    faqs: [
      {
        q: "Do I need an MRI?",
        a: "Not always. Many knee problems can be diagnosed from history and examination. Imaging is used when it will change what we do next.",
      },
      {
        q: "Should I stop exercising completely?",
        a: "Usually not. In most cases the aim is to change what you do and how much, rather than stop. This will be discussed at your consultation.",
      },
      {
        q: "Will I need surgery?",
        a: "Most knee pain is managed without surgery. Surgery is considered when the diagnosis and your goals point to it.",
      },
    ],
  },
  shoulder: {
    key: "shoulder",
    name: "Shoulder pain",
    region: "Shoulder",
    lede: "Pain while lifting, reaching overhead, reaching behind you, or lying on that side at night.",
    image: photos.consultRoom,
    what: "The shoulder trades stability for range of movement, so it depends heavily on the rotator cuff and the muscles around the shoulder blade. Pain usually comes from the tendons, the joint itself, or the way the shoulder blade moves — and the pattern of which movements hurt tells us a lot.",
    symptoms: [
      "Pain lifting the arm above shoulder height",
      "Night pain when lying on that side",
      "Weakness reaching or carrying",
      "Stiffness putting on a shirt or reaching behind",
      "Clicking with certain movements",
    ],
    causes: [
      "Rotator cuff overload or tear",
      "Frozen shoulder",
      "Gym loading, especially overhead and bench pressing",
      "Falls onto an outstretched hand or the shoulder",
      "Repetitive overhead work or sport",
      "Arthritis of the shoulder or the joint at the top of it",
    ],
    seek: [
      "You cannot lift the arm at all after an injury",
      "The shoulder looks out of shape after a fall",
      "Pain wakes you consistently at night",
      "Weakness is getting worse",
      "Stiffness is progressing over weeks",
    ],
    evaluated: [
      "History of onset and aggravating movements",
      "Examination of range, strength and specific cuff tests",
      "X-ray where indicated",
      "Ultrasound or MRI for suspected cuff problems",
      "Review of your training or work load",
    ],
    options: [
      "Load and technique modification",
      "Physiotherapy focused on cuff and scapular control",
      "Injection in selected cases",
      "Surgical repair in selected cases",
    ],
    recovery:
      "Rotator cuff problems typically respond to a structured strengthening programme over several months rather than weeks. Frozen shoulder follows its own long course. Timelines are given after diagnosis.",
    faqs: [
      {
        q: "Can I keep going to the gym?",
        a: "Often yes, with changes to which movements and how much load. That is decided case by case.",
      },
      {
        q: "Is an injection a cure?",
        a: "An injection is used to reduce pain so rehabilitation can progress. It is not usually a treatment on its own.",
      },
    ],
  },
  back: {
    key: "back",
    name: "Back & neck pain",
    region: "Spine",
    lede: "Stiffness, ache and movement-related pain in the lower back or neck — often worse after sitting or commuting.",
    image: photos.lounge,
    what: "Most back and neck pain is mechanical: it relates to how the spine is loaded and moved rather than to serious structural damage. It is common, it is usually treatable, and imaging findings often do not match how much it hurts.",
    symptoms: [
      "Ache or stiffness after sitting or driving",
      "Pain bending, lifting or turning",
      "Neck pain after long laptop sessions",
      "Headache starting at the base of the skull",
      "Pain, pins and needles or numbness travelling into an arm or leg",
    ],
    causes: [
      "Prolonged sitting and long commutes",
      "Poorly set-up workstations",
      "Sudden lifting or twisting",
      "Deconditioning and low overall activity",
      "Age-related disc and joint change",
    ],
    seek: [
      "Weakness in an arm or leg",
      "Numbness around the groin or changes in bladder or bowel control",
      "Pain following a significant fall or accident",
      "Unexplained weight loss or fever with back pain",
      "Pain that is severe, constant and not relieved by position",
    ],
    evaluated: [
      "History including work setup and daily load",
      "Neurological and movement examination",
      "Imaging only where it will change management",
      "Screening for the small number of causes that need urgent attention",
    ],
    options: [
      "Activity advice and graded return to movement",
      "Workstation and commute adjustments",
      "Physiotherapy and progressive strengthening",
      "Pain management as advised",
      "Referral where a structural cause is confirmed",
    ],
    recovery:
      "Most episodes improve over days to weeks with movement and load management. Recurrence is common, which is why the plan usually includes what to change, not just what to take.",
    faqs: [
      {
        q: "Should I rest completely?",
        a: "Extended bed rest generally makes mechanical back pain worse. Gentle movement is usually part of recovery.",
      },
      {
        q: "Do I need an MRI for back pain?",
        a: "Usually not at first presentation. Imaging is indicated when specific findings suggest it.",
      },
    ],
  },
  sports: {
    key: "sports",
    name: "Sports injuries",
    region: "Sports",
    lede: "Injuries from gym, running, football, cricket, badminton, cycling and trekking — and getting back to them safely.",
    image: photos.imagingRoom,
    what: "A sports injury is treated with the sport in mind. The question is not only what is injured but what you need to be able to do again — sprint, pivot, bowl, lift overhead — and the plan is built backwards from that.",
    symptoms: [
      "A sudden pop, tear or giving way during activity",
      "Swelling within hours of an injury",
      "Inability to continue playing",
      "Pain that returns each time you resume training",
      "Loss of confidence in a limb",
    ],
    causes: [
      "Rapid increases in training volume or intensity",
      "Contact and twisting injuries",
      "Inadequate warm-up or recovery",
      "Returning to sport before rehabilitation is complete",
      "Technique and equipment factors",
    ],
    seek: [
      "You could not continue playing",
      "The joint swelled within a few hours",
      "The joint gives way or feels unstable",
      "You cannot bear weight",
      "The same injury keeps recurring",
    ],
    evaluated: [
      "Mechanism of injury in detail",
      "Sport-specific examination and functional testing",
      "Imaging where a structural injury is suspected",
      "Discussion of your season, training and goals",
    ],
    options: [
      "Early management of swelling and pain",
      "Staged rehabilitation with clear progression criteria",
      "ACL and PCL reconstruction where indicated",
      "Achilles tendon repair where indicated",
      "Return-to-play testing before clearance",
    ],
    recovery:
      "Return to sport is decided on criteria — strength, control and confidence — not only on time elapsed. A ligament reconstruction is typically a multi-month programme; a muscle strain may be weeks.",
    faqs: [
      {
        q: "When can I play again?",
        a: "When you meet the criteria set for your injury and sport. That is assessed rather than estimated.",
      },
      {
        q: "Do you treat recreational athletes?",
        a: "Yes. Most people we see play or train recreationally rather than professionally.",
      },
    ],
  },
  foot: {
    key: "foot",
    name: "Foot & ankle",
    region: "Foot & Ankle",
    lede: "Pain, swelling or difficulty walking — from a rolled ankle to heel pain that will not settle.",
    image: photos.imaging2,
    what: "The foot and ankle take your full body weight thousands of times a day, so small problems become persistent quickly. Ankle sprains, Achilles problems and heel pain are the most common presentations.",
    symptoms: [
      "Pain on the first steps in the morning",
      "Swelling around the ankle after activity",
      "Repeated ankle rolling",
      "Pain at the back of the heel",
      "Difficulty walking any distance",
    ],
    causes: [
      "Ankle sprains, often recurrent",
      "Achilles tendon overload or rupture",
      "Plantar heel pain",
      "Sudden increases in running or walking",
      "Footwear and surface changes",
    ],
    seek: [
      "You cannot bear weight after an injury",
      "There is obvious deformity",
      "Sudden severe pain at the back of the ankle with difficulty pushing off",
      "Numbness or coldness in the foot",
      "Pain persisting beyond a few weeks",
    ],
    evaluated: [
      "History and examination including gait",
      "X-ray where fracture is suspected",
      "Ultrasound or MRI for tendon problems",
      "Assessment of footwear and training load",
    ],
    options: [
      "Protection and graded loading",
      "Physiotherapy and calf strengthening",
      "Orthoses or footwear advice where appropriate",
      "Achilles tendon repair where indicated",
    ],
    recovery:
      "Ankle sprains usually settle over weeks but need strengthening to prevent recurrence. Achilles problems respond slowly and need patient, progressive loading.",
    faqs: [
      {
        q: "Is it broken or sprained?",
        a: "That is decided by examination and, where indicated, an X-ray. Both can be very painful.",
      },
      {
        q: "Should I keep walking on it?",
        a: "Usually some loading is helpful, but the amount depends on the injury.",
      },
    ],
  },
  work: {
    key: "work",
    name: "Work-related pain",
    region: "Workplace",
    lede: "Neck, back, wrist and posture-related problems from desk work, laptops and long commutes.",
    image: photos.waiting2,
    what: "Work-related musculoskeletal pain is a load problem, not a posture moral failing. Nine hours in one position with a laptop below eye level, plus an hour each way on Hosur Road, adds up to a large and repetitive load on a small number of tissues.",
    symptoms: [
      "Neck ache building through the working day",
      "Lower back pain after the commute",
      "Wrist or thumb pain with mouse use",
      "Shoulder tension and headaches",
      "Pain easing on weekends and returning on Monday",
    ],
    causes: [
      "Laptop use without a separate screen or keyboard",
      "Chairs and desks that do not fit you",
      "Long uninterrupted sitting",
      "Low overall physical activity",
      "Long two-wheeler or car commutes",
    ],
    seek: [
      "Numbness, tingling or weakness in an arm or hand",
      "Pain waking you at night",
      "Symptoms progressing over weeks",
      "Pain limiting your ability to work",
    ],
    evaluated: [
      "History of your working day and setup",
      "Examination of the neck, shoulders, back and wrists",
      "Screening for nerve involvement",
      "Practical review of what can change at your desk",
    ],
    options: [
      "Workstation and habit changes",
      "Movement breaks and load management",
      "Physiotherapy and strengthening",
      "Wrist splinting or injection in selected cases",
    ],
    recovery:
      "These problems usually improve when the daily load changes, and recur when it does not. The plan is as much about your desk and your week as about treatment.",
    faqs: [
      {
        q: "Will a standing desk fix this?",
        a: "Changing position regularly helps more than any single position. A standing desk used badly causes its own problems.",
      },
      {
        q: "Is this permanent damage?",
        a: "In most cases, no. Persistent pain does not necessarily mean ongoing tissue damage.",
      },
    ],
  },
};

export const conditionDir = Object.values(conditions);

export const alsoTreated = [
  "Hip",
  "Wrist & Hand",
  "Elbow",
  "Arthritis",
  "Fractures",
  "Muscle & Tendon",
];

/* ── treatments ───────────────────────────────────────────────────── */

export type Treatment = {
  key: string;
  name: string;
  blurb: string;
  status: string;
  involves: string;
  who: string[];
  expect: string[];
  recovery: string;
  faqs: Faq[];
};

export const treatments: Record<string, Treatment> = {
  consultation: {
    key: "consultation",
    name: "Orthopaedic consultation",
    blurb: "History, examination and a plain explanation of what is going on and what to do next.",
    status: "Offered",
    involves:
      "A consultation with Dr. Neel covering your history, an examination, a discussion of what is likely going on, and a written plan for what happens next. Where imaging or referral is needed, that is arranged.",
    who: [
      "New pain or injury you want assessed",
      "A problem that has not settled on its own",
      "A second opinion on an existing diagnosis",
      "Follow-up on an ongoing treatment plan",
    ],
    expect: [
      "Check-in at reception",
      "Consultation and examination",
      "Discussion of findings and options",
      "A plan, and a follow-up appointment where appropriate",
    ],
    recovery:
      "A consultation is the starting point rather than a treatment. What follows depends on the diagnosis.",
    faqs: [
      { q: "How long does a consultation take?", a: `A standard consultation is around ${appointmentPolicy.consultationMinutes} minutes.` },
      {
        q: "Do I need an X-ray beforehand?",
        a: "Not usually. Bring any imaging you already have; further imaging is arranged if needed.",
      },
    ],
  },
  "sports-injury": {
    key: "sports-injury",
    name: "Sports injury management",
    blurb: "Assessment, treatment and a return-to-activity plan for sport injuries.",
    status: "Offered",
    involves:
      "Assessment of a sport-related injury with the demands of your sport in mind, followed by treatment and a staged return-to-activity plan with clear criteria for each stage.",
    who: [
      "Gym, running and field sport injuries",
      "Recurrent injuries that return on resuming training",
      "Athletes planning a return to a specific season or event",
    ],
    expect: [
      "Detailed history of the injury mechanism",
      "Sport-specific examination and functional testing",
      "Imaging where a structural injury is suspected",
      "A staged plan with return-to-activity criteria",
    ],
    recovery:
      "Return to sport is decided on measured criteria rather than time alone. Timelines are given once the diagnosis is clear.",
    faqs: [
      { q: "Do I need to stop training entirely?", a: "Often not. Training is usually modified rather than stopped." },
      { q: "Can you coordinate with my coach?", a: "[ To be confirmed by the clinic. ]" },
    ],
  },
  physiotherapy: {
    key: "physiotherapy",
    name: "Physiotherapy",
    blurb: "Hands-on treatment and exercise progression for pain, stiffness and weakness.",
    status: "[ Availability to be confirmed ]",
    involves:
      "Hands-on treatment and a progressive exercise programme addressing pain, stiffness, weakness and movement control.",
    who: [
      "People recovering from injury or surgery",
      "Persistent pain that needs a loading plan",
      "Work-related neck, back and wrist problems",
    ],
    expect: [
      "Assessment of movement and strength",
      "Treatment session",
      "A home programme you can actually do",
      "Review and progression",
    ],
    recovery:
      "Physiotherapy works through progression over weeks. The home programme matters more than the number of sessions.",
    faqs: [
      { q: "Is physiotherapy available on site?", a: "[ To be confirmed by the clinic. ]" },
      { q: "How many sessions will I need?", a: "That depends on the problem and is reviewed as you progress." },
    ],
  },
  rehabilitation: {
    key: "rehabilitation",
    name: "Rehabilitation",
    blurb: "Structured, staged loading to rebuild strength and confidence after injury or surgery.",
    status: "[ To be confirmed ]",
    involves:
      "A structured, staged loading programme to rebuild strength, control and confidence after injury or surgery.",
    who: [
      "After ligament reconstruction or joint surgery",
      "After a significant sports injury",
      "Persistent weakness or loss of confidence in a limb",
    ],
    expect: [
      "Baseline testing",
      "Stage-by-stage progression with criteria",
      "Regular reassessment",
      "Discharge planning",
    ],
    recovery:
      "Rehabilitation after major surgery is typically measured in months and progresses in defined stages.",
    faqs: [{ q: "Can I do this at my own gym?", a: "Often yes, with a programme and periodic review." }],
  },
  prp: {
    key: "prp",
    name: "PRP therapy",
    blurb: "Platelet-rich plasma from your own blood, for selected tendon and joint problems.",
    status: "[ To be confirmed ]",
    involves:
      "Blood is taken from you, processed to concentrate the platelets, and injected into the affected tendon or joint.",
    who: ["[ Indications offered at this clinic — to be confirmed. ]"],
    expect: [
      "Blood sample taken",
      "Preparation of the injection",
      "Injection under clinical conditions",
      "Post-injection instructions and follow-up",
    ],
    recovery: "[ Post-procedure guidance and expected timeline — to be confirmed by the clinic. ]",
    faqs: [{ q: "Is PRP offered here?", a: "[ To be confirmed by the clinic. This page is a placeholder. ]" }],
  },
  injections: {
    key: "injections",
    name: "Joint injections",
    blurb: "Targeted injections used for pain and inflammation in selected joints.",
    status: "[ To be confirmed ]",
    involves:
      "A targeted injection into or around a joint or tendon, used to reduce pain and inflammation so rehabilitation can progress.",
    who: ["[ Indications offered at this clinic — to be confirmed. ]"],
    expect: [
      "Discussion of risks and benefits",
      "The injection itself",
      "A short observation period",
      "Follow-up and rehabilitation plan",
    ],
    recovery: "[ Aftercare and expected timeline — to be confirmed by the clinic. ]",
    faqs: [{ q: "How long does it last?", a: "[ To be confirmed by the clinic. ]" }],
  },
  fracture: {
    key: "fracture",
    name: "Fracture management",
    blurb: "Assessment, immobilisation and follow-up of bone injuries.",
    status: "[ To be confirmed ]",
    involves:
      "Assessment of a suspected or confirmed bone injury, immobilisation where required, and follow-up until union.",
    who: [
      "Recent injuries with suspected fracture",
      "Follow-up of a fracture already diagnosed elsewhere",
    ],
    expect: [
      "Examination and X-ray",
      "Immobilisation or referral as required",
      "Follow-up imaging",
      "Rehabilitation once healing allows",
    ],
    recovery:
      "Bone healing timelines depend on the bone and the injury and will be explained specifically.",
    faqs: [{ q: "Is X-ray available at the clinic?", a: "[ To be confirmed by the clinic. ]" }],
  },
  "joint-replacement": {
    key: "joint-replacement",
    name: "Joint replacement surgery",
    blurb: "Surgical replacement of a damaged knee or hip joint.",
    status: "Offered",
    involves:
      "Surgical replacement of a damaged knee or hip joint, with pre-operative planning and a structured post-operative rehabilitation programme.",
    who: [
      "Advanced arthritis limiting walking, sleep and daily life",
      "People who have not improved with non-surgical management",
    ],
    expect: [
      "Consultation and imaging",
      "Discussion of whether surgery is appropriate for you",
      "Pre-operative planning",
      "Surgery and staged rehabilitation",
    ],
    recovery:
      "Recovery is staged over months, with early mobilisation followed by progressive strengthening. Specific timelines are given at consultation.",
    faqs: [
      { q: "Where is surgery performed?", a: "[ Operating hospital — to be confirmed by the clinic. ]" },
      { q: "What does it cost?", a: "[ To be confirmed by the clinic. ]" },
    ],
  },
  acl: {
    key: "acl",
    name: "ACL & PCL reconstruction",
    blurb:
      "Reconstruction of torn cruciate ligaments of the knee, followed by staged rehabilitation.",
    status: "Offered",
    involves:
      "Reconstruction of a torn anterior or posterior cruciate ligament of the knee, followed by a staged rehabilitation programme.",
    who: [
      "Confirmed cruciate ligament tears",
      "Knees that give way during sport or daily life",
      "Athletes intending to return to pivoting sport",
    ],
    expect: [
      "Examination and MRI",
      "Pre-operative rehabilitation to restore range and strength",
      "Surgery",
      "A staged return-to-sport programme",
    ],
    recovery:
      "Return to pivoting sport after cruciate reconstruction is a multi-month programme decided on criteria, not on the calendar alone.",
    faqs: [
      {
        q: "Do all ACL tears need surgery?",
        a: "No. The decision depends on your knee, your symptoms and what you need to return to.",
      },
    ],
  },
  "post-op": {
    key: "post-op",
    name: "Post-operative rehabilitation",
    blurb: "Follow-up and rehabilitation after orthopaedic surgery.",
    status: "[ To be confirmed ]",
    involves:
      "Follow-up and rehabilitation after orthopaedic surgery, whether performed here or elsewhere.",
    who: ["Recent orthopaedic surgery", "Slow or stalled recovery after an operation"],
    expect: [
      "Wound and progress review",
      "Staged rehabilitation",
      "Return-to-work and return-to-sport planning",
    ],
    recovery: "Staged over weeks to months depending on the procedure.",
    faqs: [
      { q: "Can you take over rehab after surgery elsewhere?", a: "[ To be confirmed by the clinic. ]" },
    ],
  },
};

export const treatmentDir = Object.values(treatments);
export const treatmentHomeKeys = ["consultation", "sports-injury", "physiotherapy", "rehabilitation"];

/* ── health library ───────────────────────────────────────────────── */

export type Article = {
  key: string;
  title: string;
  category: string;
  read: string;
  image: Photo;
  date: string;
  author: string;
};

export const articles: Record<string, Article> = {
  stairs: {
    key: "stairs",
    title: "Why does my knee hurt when I climb stairs?",
    category: "Knee",
    read: "5 min read",
    image: photos.consultRoom,
    date: "18 August 2026",
    author: "Dr. Neel",
  },
  "strength-ageing": {
    key: "strength-ageing",
    title: "Is strength training safe as you get older?",
    category: "Healthy ageing",
    read: "6 min read",
    image: photos.waiting2,
    date: "02 August 2026",
    author: "Dr. Neel",
  },
  "commute-back": {
    key: "commute-back",
    title: "Why does my back hurt after a long commute?",
    category: "Workplace",
    read: "4 min read",
    image: { src: photos.lounge.src, alt: "Clinic lounge" },
    date: "21 July 2026",
    author: "Dr. Neel",
  },
  "shoulder-exercise": {
    key: "shoulder-exercise",
    title: "Should you exercise with shoulder pain?",
    category: "Shoulder",
    read: "5 min read",
    image: { src: photos.consultDesk.src, alt: "Consultation desk" },
    date: "09 July 2026",
    author: "Dr. Neel",
  },
  "clicking-knee": {
    key: "clicking-knee",
    title: "What does a clicking knee actually mean?",
    category: "Knee",
    read: "4 min read",
    image: { src: photos.imagingRoom.src, alt: "Imaging room" },
    date: "28 June 2026",
    author: "Dr. Neel",
  },
  "gym-shoulder": {
    key: "gym-shoulder",
    title: "Bench press and shoulder pain: what to change first",
    category: "Gym",
    read: "6 min read",
    image: { src: photos.reception.src, alt: "Reception" },
    date: "14 June 2026",
    author: "Dr. Neel",
  },
  "ankle-sprain": {
    key: "ankle-sprain",
    title: "A rolled ankle that will not settle",
    category: "Sports",
    read: "5 min read",
    image: photos.imaging2,
    date: "30 May 2026",
    author: "Dr. Neel",
  },
  "after-surgery": {
    key: "after-surgery",
    title: "The first six weeks after knee surgery",
    category: "Recovery",
    read: "7 min read",
    image: { src: photos.waiting1.src, alt: "Waiting area" },
    date: "16 May 2026",
    author: "Dr. Neel",
  },
};

export const articleDir = Object.values(articles);
export const articleHomeKeys = ["stairs", "strength-ageing", "commute-back"];
export const libraryCategories = [
  "All",
  "Knee",
  "Shoulder",
  "Spine",
  "Sports",
  "Gym",
  "Workplace",
  "Recovery",
  "Healthy ageing",
];

export type Block = { kind: "h" | "p" | "note"; text: string };

/* The canvas ships one written article body; every article renders it until
   the clinic supplies its own copy. */
export const articleBody: Block[] = [
  {
    kind: "p",
    text: "Stair pain is one of the most common reasons people come in with a knee complaint, and it is a useful symptom because it narrows things down. Going up loads the knee differently from going down, and which direction hurts more tells us something.",
  },
  { kind: "h", text: "Why stairs specifically" },
  {
    kind: "p",
    text: "Climbing a stair asks the muscles at the front of the thigh to lift your whole body weight through a bent knee. Descending asks the same muscles to lower it under control, which produces higher forces across the kneecap. If pain is worse coming down, the kneecap joint is often involved.",
  },
  { kind: "h", text: "What it usually is not" },
  {
    kind: "p",
    text: "Stair pain on its own is not evidence of a serious injury. It is not the same as the knee giving way, locking, or swelling within hours of a twist — those are the symptoms that need prompt assessment.",
  },
  { kind: "h", text: "What tends to help" },
  {
    kind: "p",
    text: "For most people the useful changes are unglamorous: reduce the aggravating load for a while, build strength in the thigh and hip, and reintroduce stairs gradually rather than avoiding them permanently. Avoidance tends to make the knee less tolerant, not more.",
  },
  { kind: "h", text: "When to get it looked at" },
  {
    kind: "p",
    text: "If the pain has not changed after a few weeks of sensible loading, if the knee swells, or if it gives way, that is the point to have it examined rather than to keep experimenting.",
  },
  {
    kind: "note",
    text: "This article is general information and is not a diagnosis. If your knee is limiting what you do, book a consultation.",
  },
];

/* ── patient information ──────────────────────────────────────────── */

export const patientBring = [
  "Previous reports and discharge summaries",
  "Imaging — X-ray films, MRI or CT discs",
  "Current prescriptions",
  "A list of medications you take regularly",
  "Shorts or loose clothing if the problem is in the knee or hip",
];

export const patientExpect = [
  "Check-in and a short history at reception",
  "Consultation and examination with Dr. Neel",
  "Discussion of findings and treatment options",
  "A written plan and a follow-up appointment where appropriate",
];

export const patientFaqs: Faq[] = [
  {
    q: "Do I need an X-ray before my appointment?",
    a: "Not usually. Bring any imaging you already have. If further imaging is needed, it will be arranged after the consultation.",
  },
  { q: "How long does a consultation take?", a: `A standard consultation is around ${appointmentPolicy.consultationMinutes} minutes.` },
  {
    q: "Can I exercise with pain?",
    a: "Often yes, in a modified form. Whether and how depends on what is causing the pain, which is what the consultation establishes. General advice online cannot answer this for your case.",
  },
  {
    q: "Do I need surgery?",
    a: "Most orthopaedic problems are managed without surgery. Where surgery is a reasonable option it will be explained alongside the alternatives, including doing nothing for now.",
  },
  {
    q: "Do you treat sports injuries?",
    a: "Yes. Sports injury management, including ACL and PCL reconstruction and Achilles tendon injuries, is a focus of the clinic.",
  },
  {
    q: "Can I walk in without an appointment?",
    a: "Booked appointments are always seen ahead of walk-ins, so booking online or by phone is recommended. If you do walk in, you will be seen once booked patients for that slot have been attended to.",
  },
  {
    q: "What if I'm running late?",
    a: `Please try to arrive on time. If you arrive more than ${appointmentPolicy.graceMinutes} minutes after your appointment time, the next patient may be seen ahead of you and your appointment may be marked as a no-show.`,
  },
  {
    q: "What should I bring to my consultation?",
    a: "Previous reports, any imaging (films or discs), current prescriptions and a list of medications you take. If the problem relates to sport or work, details of your training or your working setup are useful.",
  },
];
