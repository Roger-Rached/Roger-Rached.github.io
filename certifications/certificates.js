/* Certificate directory data and renderer.
   Keep credential details here so future additions do not require duplicated card markup. */
const certificateGroups = [
  {
    issuer: "TryHackMe",
    certificates: [
      { name: "Pre Security", issued: "January 2022", credentialId: "THM-0DWMDZI8VR", url: "https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-0DWMDZI8VR.pdf", linkLabel: "View Certificate", industry: "CYBERSECURITY FOUNDATIONS", description: "Foundational IT and cyber concepts spanning computer systems, operating systems, basic programming, networking, web fundamentals, and introductory attacks and defenses." },
      { name: "Complete Beginner", issued: "March 2022", credentialId: "THM-M0LIQAXTUJ", url: "https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-M0LIQAXTUJ.pdf", linkLabel: "View Certificate", industry: "CYBERSECURITY FOUNDATIONS", description: "An earlier beginner pathway covering core cybersecurity concepts, networking, Linux and Windows basics, introductory tools, and guided defensive and offensive exercises." },
      { name: "Jr Penetration Tester", issued: "August 2022", credentialId: "THM-JSGZD32KXZ", url: "https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-JSGZD32KXZ.pdf", linkLabel: "View Certificate", industry: "OFFENSIVE SECURITY", description: "Introduces the penetration-testing workflow, reconnaissance, enumeration, web and network assessments, exploitation fundamentals, and reporting through practical labs." },
      { name: "Web Fundamentals", issued: "August 2022", credentialId: "THM-UJAXSIBMFF", url: "https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-UJAXSIBMFF.pdf", linkLabel: "View Certificate", industry: "WEB APPLICATION SECURITY", description: "Covers how web applications work, HTTP and DNS basics, Burp Suite fundamentals, and practical exposure to common web vulnerabilities." },
      { name: "Cyber Security 101", issued: "February 2025", credentialId: "THM-7ITWYHKEUO", url: "https://tryhackme.com/certificate/THM-7ITWYHKEUO", linkLabel: "View Certificate", industry: "CYBERSECURITY FOUNDATIONS", description: "Covers essential security concepts, threats and vulnerabilities, networking and operating-system basics, and introductory offensive and defensive techniques." }
    ]
  },
  {
    issuer: "Security Blue Team",
    certificates: [
      { name: "Mental Health in Cybersecurity", issued: "December 2024", credentialId: "134890422", url: "https://media.licdn.com/dms/image/v2/D4D2DAQEJiLWy0cJ6cw/profile-treasury-document-images_1280/profile-treasury-document-images_1280/1/1736345655054?e=1793836800&v=beta&t=vRpZzmNMI5NstonA-wOwkZiI4zYqucDghY3ZqT7HmQQ", linkLabel: "View Certificate", industry: "CYBERSECURITY WELLBEING", description: "Professional-development learning about mental health and wellbeing considerations for people working and learning in cybersecurity." },
      { name: "Blue Team Junior Analyst", issued: "January 2025", credentialId: "240122180", industry: "BLUE TEAM / SOC", description: "Introduces blue-team analyst concepts, including security monitoring, basic alert triage, log review, and incident-handling fundamentals." }
    ]
  },
  {
    issuer: "TCM Security",
    certificates: [
      { name: "Programming 100: Fundamentals", issued: "November 2025", credentialId: "cert_2qj0b31m", industry: "PROGRAMMING / AUTOMATION", description: "Python fundamentals including variables, control flow, functions, data structures, modules, debugging, and basic software-development practices." },
      { name: "Practical Security Fundamentals", issued: "October 2025", credentialId: "cert_3r25ht7y", industry: "SECURITY FOUNDATIONS", description: "Introductory practical security across common threats, red and blue team roles, defensive tooling, cryptography, authentication, security frameworks, and incident response." },
      { name: "Practical Help Desk", issued: "October 2025", credentialId: "cert_ckr6xv35", skills: ["Help Desk Support"], industry: "IT SUPPORT / SYSTEMS", description: "Practical IT support fundamentals covering troubleshooting, operating systems, networking, virtualization, remote support, ticketing, and Windows Active Directory basics." },
      { name: "Linux 100: Fundamentals", issued: "September 2025", credentialId: "cert_lrf9k1gm", industry: "LINUX / SYSTEM ADMINISTRATION", description: "Linux installation and command-line use, filesystem navigation, users and privileges, services, network commands, software management, and introductory Bash." },
      { name: "Open-Source Intelligence (OSINT) Fundamentals", issued: "November 2022", credentialId: "cert_4kbwcnhg", industry: "OSINT / THREAT INTELLIGENCE", description: "OSINT research methods for search engines, images, email addresses, usernames, websites, social media, tools, automation, OPSEC, note-taking, and reporting." }
    ]
  },
  {
    issuer: "Google",
    certificates: [
      { name: "Google Cybersecurity Professional Certificate", issued: "March 2024", credentialId: "9JZZDDLN6F3N", url: "https://www.coursera.org/account/accomplishments/specialization/9JZZDDLN6F3N", linkLabel: "Verify Credential", industry: "SECURITY OPERATIONS / ANALYST", description: "Entry-level cybersecurity preparation covering risks and threats, Linux, SQL, Python, SIEM, intrusion detection, security analysis, and mitigation principles." }
    ]
  },
  {
    issuer: "AttackIQ",
    certificates: [
      { name: "Foundations of Operationalizing MITRE ATT&CK", issued: "April 12, 2022", url: "https://www.credly.com/badges/db0491f9-c727-46eb-b128-17dc906a0ce9", linkLabel: "View Badge", industry: "DETECTION ENGINEERING / PURPLE TEAM", description: "Foundational training on applying MITRE ATT&CK operationally, using Navigator and related resources, and finding, creating, and testing security analytics." }
    ]
  },
  {
    issuer: "Cisco Networking Academy",
    certificates: [
      { name: "Introduction to Cybersecurity", issued: "November 2025", url: "https://www.credly.com/badges/e71f3584-3c43-4a26-a14d-eb014cfe05ef", linkLabel: "View Badge", industry: "CYBERSECURITY FOUNDATIONS", description: "Introductory cybersecurity concepts, common attacks, data and privacy protection, organizational security, and basic legal and ethical considerations." },
      { name: "Cisco CyberOps Associate", issued: "January 2026", url: "https://www.credly.com/badges/850370bc-caff-4c42-8ba3-f0c0c0c9e6e5", linkLabel: "View Badge", industry: "SECURITY OPERATIONS / SOC", description: "Security operations concepts for monitoring and analyzing security events, investigating network and endpoint indicators, and supporting incident response." },
      { name: "Cisco CCNA — AOU", issuerNote: "Cisco / Arab Open University (AOU)", entryType: "Certificate / qualification", industry: "NETWORKING / INFRASTRUCTURE", description: "CCNA-aligned networking coursework covering network fundamentals, IP connectivity, routing and switching concepts, network services, and troubleshooting." }
    ]
  },
  {
    issuer: "Semicolon Security",
    certificates: [
      { name: "Information Security Associate", issued: "July 2026", credentialId: "38322357", industry: "INFORMATION SECURITY", description: "Information-security foundations, including security principles, awareness of common threats, risk concepts, and protective practices." },
      { name: "Certified Offensive Application Security Associate", issued: "August 2026", credentialId: "66722344", industry: "OFFENSIVE SECURITY / APPSEC", description: "Offensive application-security focus, including practical web assessment methodology, identifying common weaknesses, and penetration-testing fundamentals." }
    ]
  }
];

(() => {
  const directory = document.querySelector("#certification-directory");
  if (!directory) return;
  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null && text !== "") el.textContent = text;
    return el;
  };
  const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const total = certificateGroups.reduce((n,g)=>n+g.certificates.length,0);
  const previewTotal = certificateGroups.reduce((n,g)=>n+g.certificates.filter(c=>c.image).length,0);
  const panel=make("section","credential-tools");
  panel.setAttribute("aria-label","Certification directory tools");
  const stats=make("div","credential-summary");
  [{value:String(total).padStart(2,"0"),label:"Credential entries"},{value:String(certificateGroups.length).padStart(2,"0"),label:"Issuing organizations"},{value:String(previewTotal).padStart(2,"0"),label:"Certificate previews"}].forEach(item=>{
    const stat=make("div","credential-stat");
    stat.append(make("span","credential-stat-value",item.value),make("span","credential-stat-label",item.label));stats.append(stat);
  });
  panel.append(stats);
  const nav=make("nav","credential-issuer-nav");nav.setAttribute("aria-label","Jump to an issuing organization");
  certificateGroups.forEach(group=>{const a=make("a","credential-issuer-chip",group.issuer);a.href="#issuer-"+slug(group.issuer);nav.append(a);});
  panel.append(nav);
  const row=make("div","credential-search-row");
  const label=make("label","credential-search-label","Find a credential");
  const input=make("input","credential-search-input");input.type="search";input.placeholder="Search by certificate, issuer, date, or ID…";input.autocomplete="off";input.setAttribute("aria-label","Search certificates by name, issuer, date, or credential ID");label.append(input);
  const count=make("p","credential-result-count",total+" entries");count.setAttribute("aria-live","polite");row.append(label,count);panel.append(row);
  const empty=make("p","credential-empty-state","No certificates match your search. Try another name, issuer, or credential ID.");empty.hidden=true;directory.before(panel,empty);
  const cards=[];
  certificateGroups.forEach((group,i)=>{
    const section=make("section","page-section credential-section");section.id="issuer-"+slug(group.issuer);section.setAttribute("aria-labelledby","issuer-heading-"+(i+1));
    const sh=make("div","page-section-title");sh.append(make("span","number",String(i+1).padStart(2,"0")));
    const h=make("h2","",group.issuer);h.id="issuer-heading-"+(i+1);sh.append(h);section.append(sh);
    const grid=make("div","page-grid credential-grid");
    group.certificates.forEach(c=>{
      const card=make("article","page-card credential-card");
      const top=make("div","credential-card-top");top.append(make("span","section-label",c.entryType||group.issuer));card.append(top);
      if(c.image){
        const preview=make("a","credential-preview");preview.href=c.image;preview.target="_blank";preview.rel="noopener noreferrer";preview.setAttribute("aria-label","Open certificate image for "+c.name+" in a new tab");
        const img=make("img","credential-preview-image");img.src=c.image;img.alt="Certificate preview: "+c.name;img.loading="lazy";img.decoding="async";preview.append(img,make("span","credential-preview-hint","Open image ↗"));card.append(preview);
      }
      card.append(make("h3","credential-title",c.name));
      if(c.industry)card.append(make("p","credential-industry","INDUSTRY FOCUS · "+c.industry));
      if(c.description)card.append(make("p","credential-description",c.description));
      const meta=make("dl","credential-metadata");
      if(c.issued)meta.append(make("dt","","Issued"),make("dd","",c.issued));
      if(c.credentialId)meta.append(make("dt","","Credential ID"),make("dd","credential-id-value",c.credentialId));
      if(meta.childElementCount)card.append(meta);
      if(c.issuerNote)card.append(make("p","credential-note","Issuer: "+c.issuerNote));
      if(c.skills&&c.skills.length){const tags=make("div","page-tag-row credential-skills");c.skills.forEach(skill=>tags.append(make("span","page-tag",skill)));card.append(tags);}
      if(c.url){const name=c.linkLabel||"View Certificate";const a=make("a","page-link credential-link",name+" ↗");a.href=c.url;a.target="_blank";a.rel="noopener noreferrer";a.setAttribute("aria-label",name+": "+c.name+" (opens in a new tab)");card.append(a);}
      else card.append(make("p","credential-unlinked","No verification link provided."));
      const search=[c.name,group.issuer,c.issued,c.credentialId,c.issuerNote,...(c.skills||[])].filter(Boolean).join(" ").toLowerCase();cards.push({card,search});grid.append(card);
    });
    section.append(grid);directory.append(section);
  });
  input.addEventListener("input",()=>{
    const q=input.value.trim().toLowerCase();let visible=0;
    cards.forEach(({card,search})=>{const match=!q||search.includes(q);card.hidden=!match;if(match)visible++;});
    certificateGroups.forEach(group=>{const section=document.getElementById("issuer-"+slug(group.issuer));if(section)section.hidden=!Array.from(section.querySelectorAll(".credential-card")).some(card=>!card.hidden);});
    count.textContent=q?visible+" of "+total+" entries":total+" entries";empty.hidden=visible>0;
  });
})();