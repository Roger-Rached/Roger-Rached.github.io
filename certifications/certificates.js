/* Certificate directory data and renderer.
   Keep credential details here so future additions do not require duplicated card markup. */
const certificateGroups = [
  {
    issuer: "TryHackMe",
    certificates: [
      { name: "Pre Security", issued: "January 2022", credentialId: "THM-0DWMDZI8VR", url: "https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-0DWMDZI8VR.pdf", linkLabel: "View Certificate" },
      { name: "Complete Beginner", issued: "March 2022", credentialId: "THM-M0LIQAXTUJ", url: "https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-M0LIQAXTUJ.pdf", linkLabel: "View Certificate" },
      { name: "Jr Penetration Tester", issued: "August 2022", credentialId: "THM-JSGZD32KXZ", url: "https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-JSGZD32KXZ.pdf", linkLabel: "View Certificate" },
      { name: "Web Fundamentals", issued: "August 2022", credentialId: "THM-UJAXSIBMFF", url: "https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-UJAXSIBMFF.pdf", linkLabel: "View Certificate" },
      { name: "Cyber Security 101", issued: "February 2025", credentialId: "THM-7ITWYHKEUO", url: "https://tryhackme.com/certificate/THM-7ITWYHKEUO", linkLabel: "View Certificate" }
    ]
  },
  {
    issuer: "Security Blue Team",
    certificates: [
      { name: "Mental Health in Cybersecurity", issued: "December 2024", credentialId: "134890422", url: "https://media.licdn.com/dms/image/v2/D4D2DAQEJiLWy0cJ6cw/profile-treasury-document-images_1280/profile-treasury-document-images_1280/1/1736345655054?e=1793836800&v=beta&t=vRpZzmNMI5NstonA-wOwkZiI4zYqucDghY3ZqT7HmQQ", linkLabel: "View Certificate" },
      { name: "Blue Team Junior Analyst", issued: "January 2025", credentialId: "240122180" }
    ]
  },
  {
    issuer: "TCM Security",
    certificates: [
      { name: "Programming 100: Fundamentals", issued: "November 2025", credentialId: "cert_2qj0b31m" },
      { name: "Practical Security Fundamentals", issued: "October 2025", credentialId: "cert_3r25ht7y" },
      { name: "Practical Help Desk", issued: "October 2025", credentialId: "cert_ckr6xv35", skills: ["Help Desk Support"] },
      { name: "Linux 100: Fundamentals", issued: "September 2025", credentialId: "cert_lrf9k1gm" },
      { name: "Open-Source Intelligence (OSINT) Fundamentals", issued: "November 2022", credentialId: "cert_4kbwcnhg" }
    ]
  },
  {
    issuer: "Google",
    certificates: [
      { name: "Google Cybersecurity Professional Certificate", issued: "March 2024", credentialId: "9JZZDDLN6F3N", url: "https://www.coursera.org/account/accomplishments/specialization/9JZZDDLN6F3N", linkLabel: "Verify Credential" }
    ]
  },
  {
    issuer: "AttackIQ",
    certificates: [
      { name: "Foundations of Operationalizing MITRE ATT&CK", issued: "April 12, 2022", url: "https://www.credly.com/badges/db0491f9-c727-46eb-b128-17dc906a0ce9", linkLabel: "View Badge" }
    ]
  },
  {
    issuer: "Cisco Networking Academy",
    certificates: [
      { name: "Introduction to Cybersecurity", issued: "November 2025", url: "https://www.credly.com/badges/e71f3584-3c43-4a26-a14d-eb014cfe05ef", linkLabel: "View Badge" },
      { name: "Cisco CyberOps Associate", issued: "January 2026", url: "https://www.credly.com/badges/850370bc-caff-4c42-8ba3-f0c0c0c9e6e5", linkLabel: "View Badge" },
      { name: "Cisco CCNA — AOU", issuerNote: "Cisco / Arab Open University (AOU)", entryType: "Certificate / qualification" }
    ]
  },
  {
    issuer: "Semicolon Security",
    certificates: [
      { name: "Information Security Associate", issued: "July 2026", credentialId: "38322357" },
      { name: "Certified Offensive Application Security Associate", issued: "August 2026", credentialId: "66722344" }
    ]
  }
];

(() => {
  const directory = document.querySelector("#certification-directory");
  if (!directory) return;

  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null && text !== "") element.textContent = text;
    return element;
  };

  certificateGroups.forEach((group, groupIndex) => {
    const section = make("section", "page-section credential-section");
    section.setAttribute("aria-labelledby", `issuer-heading-${groupIndex + 1}`);

    const sectionHeading = make("div", "page-section-title");
    sectionHeading.append(make("span", "number", String(groupIndex + 1).padStart(2, "0")));
    const heading = make("h2", "", group.issuer);
    heading.id = `issuer-heading-${groupIndex + 1}`;
    sectionHeading.append(heading);
    section.append(sectionHeading);

    const grid = make("div", "page-grid credential-grid");
    group.certificates.forEach((certificate) => {
      const card = make("article", "page-card credential-card");
      const issuerLine = make("div", "credential-card-top");
      issuerLine.append(make("span", "section-label", certificate.entryType || group.issuer));
      if (certificate.issued) issuerLine.append(make("span", "credential-date", certificate.issued));
      card.append(issuerLine);
      card.append(make("h3", "credential-title", certificate.name));

      const metadata = make("dl", "credential-metadata");
      if (certificate.issued) {
        const dateTerm = make("dt", "", "Issued");
        const dateValue = make("dd", "", certificate.issued);
        metadata.append(dateTerm, dateValue);
      }
      if (certificate.credentialId) {
        const idTerm = make("dt", "", "Credential ID");
        const idValue = make("dd", "credential-id-value", certificate.credentialId);
        metadata.append(idTerm, idValue);
      }
      if (metadata.childElementCount) card.append(metadata);

      if (certificate.issuerNote) {
        card.append(make("p", "credential-note", `Issuer: ${certificate.issuerNote}`));
      }
      if (certificate.skills && certificate.skills.length) {
        const tags = make("div", "page-tag-row credential-skills");
        certificate.skills.forEach((skill) => tags.append(make("span", "page-tag", skill)));
        card.append(tags);
      }
      if (certificate.url) {
        const link = make("a", "page-link credential-link", `${certificate.linkLabel || "View Certificate"} ↗`);
        link.href = certificate.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `${certificate.linkLabel || "View Certificate"}: ${certificate.name} (opens in a new tab)`);
        card.append(link);
      } else {
        card.append(make("p", "credential-unlinked", "No verification link provided."));
      }
      grid.append(card);
    });

    section.append(grid);
    directory.append(section);
  });
})();
