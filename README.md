# Joshua Shoemaker — Computer Science ePortfolio

> Live site: **[nebuflux.github.io](https://nebuflux.github.io)**

An electronic portfolio built with Next.js and hosted on GitHub Pages, showcasing three artifacts and their accompanying narratives from my Bachelor of Science in Computer Science capstone at Southern New Hampshire University.

---

## About Me

My name is Joshua Shoemaker and thank you for visiting my electronic Portfolio. I am currently an aviation electronics instructor for the United States Navy as an active-duty sailor. My work gives me a firsthand understanding of the deployment and maintenance of critical embedded systems under stressful and harsh conditions. However, I've always had an interest in software development and I've always wondered what's going on "under the hood" of the various components I replace, update, rewire, and maintain. So while on deployment, with no internet access and a random Bulgarian book I downloaded on my phone (*Fundamentals of Computer Programming with C#* by Svetlin Nakov, Veselin Kolev & Co.), I decided to have a go at programming. Over the course of about three months between my 12-hour shifts supervising the aviation electronics technician shop, I learned enough to develop a couple of programs with nothing but Windows 10 Notepad and the standard C compiler that comes on every Windows OS. One of the programs was a simple interest calculator so I could prepare for purchasing a home when I got back, and the other was a military-to-civilian pay translator which included taxes and an underestimated health insurance premium. With the confidence gained from that experience and the elation of creating two programs on my own, I was hooked. A few months after returning home from deployment and becoming an instructor, I enrolled at Southern New Hampshire University.

This Portfolio is a reflection and summation of the skills I've gained. To demonstrate those skills and my improvements, I've published three artifacts from my capstone project where I redesigned a Python State Machine, originally a smart thermostat, to an Intrusion Detection System leveraging a simple Deep Neural Network (DNN), artifact 2, to identify suspicious network activity and send alerts to an Express backend utilizing secure API endpoints to post to a database. This is artifact 1. To view these alerts, I created a simple Angular SPA with a login to display a table listing each alert identified by the IDS, artifact 3. The DNN came from the beginning of my CS370 Current/Emerging Trends in Computer Science class, originally used to classify handwritten digits from the MNIST data set. I modified that neural network to accept a filtered list of network flow attributes and output a softmax classification vector for 7 attack types. I'm grateful for the opportunity to learn as much as I did at SNHU and gain the valuable exposure to all the different aspects of software development and computer science. So what did I learn?

### Collaboration and Communication

Software development is a team effort with many different diverse moving parts. The importance of teamwork and communication with stakeholders is evident through the teachings at SNHU. I've learned that during an Agile sprint in a scrum team, communication is paramount. Though the Navy doesn't use the explicit Agile development method, I have direct experience working with a diverse group to meet an approaching deadline under technical requirements. I've learned how to spot barriers and remove those barriers or overcome them for me and my team both professionally and academically. Communicating with stakeholders reminds me of passing information up the chain to make sure those with decision-making authority have the proper input on what's happening on the front lines. In my software development lifecycle, I took on the role of a scrum master during an Agile sprint, and the final project culminated with a sprint review. Thanks to classes like Software Development Lifecycle and System Analysis and Design, I can see the practical transfer of skills from my time in the Navy to a software development team.

### Architecture and Design

I've also experienced the downstream impact of design decisions. Thankfully, SNHU offers several classes covering software architecture and design. I've gained valuable experience crafting UML sequence, class, use case, state machine, activity, and system diagrams. These provided a valuable abstract perspective that can often get lost in pseudocode and actual code. In Mobile Architecture & Programming, wire diagrams proved valuable for visualizing pages and helped to solidify the different use cases of an application. In System Analysis and Design, I explored the importance of requirement gathering, communicating with stakeholders, secure design philosophy, and the nuances of different architectures and design patterns. In the final project, I presented a design analysis which detailed the overall architecture and design for a proposed application that managed drivers for an Uber-style company. The extensive lessons from these courses enforced an appreciation for the complex nature of evolving software systems and the evolving requirements these systems must meet. Understanding the use case for the singleton method, factory pattern, visitor pattern, and others serves to implement the most appropriate, industry-standard design pattern to achieve proper architectural integrity.

### A Security Mindset

The entire computer science program places security at the forefront of development. I delved deeply into the concepts of shift-left security, the transition from DevOps to DevSecOps, and secure coding principles. I explored several real-world security vulnerabilities, from the exposed attack vector of the country's aging power infrastructure to the recent Axios NPM supply chain compromise, and many others. The curriculum's thorough incorporation of security drove home the importance of CISA, MITRE, OWASP, and others for maintaining current secure coding standards that mitigate vulnerabilities. From standard data structure security to secure password hashing and salting with SHA-256 in databases, I have obtained a secure mindset in software development principles.

### Data Structures, Algorithms, and Databases

The Computer Science program at SNHU also extensively covers Structured Query Language (SQL) and Not Only Structured Query Language (NoSQL) databases. In Intro to Structured Databases (DAD 220), I practiced normalizing databases and different methods to aggregate data from various tables. The class culminated with the final project requiring several complex queries to generate an analysis report. In more advanced classes, we got to the heart of data storage by hand-crafting linked lists, binary trees, and dictionaries, as well as mastering Big O notation and sorting algorithms. In the final project of my Data Structures and Algorithms class, I created a template class for a binary search tree in C++ to manipulate an education program catalog read from a CSV file.

---

## Artifacts

| # | Artifact | Summary |
|---|----------|---------|
| 1 | **[Inspector Gadget State Machine](https://nebuflux.github.io/artifact_1)** | A Python state machine running on a Raspberry Pi 4 that captures network traffic with Scapy, extracts per-flow features across bounded thread-safe queues, runs TFLite inference, and posts classified alerts to a secure Express backend over HTTPS. |
| 2 | **[Inspector Gadget ANN](https://nebuflux.github.io/artifact_2)** | A deep neural network originally built to classify MNIST digits, re-architected and trained on CIC-IDS2017 to output a seven-class softmax over attack categories. Quantized to 8-bit integers with TensorFlow Lite for edge deployment on the Pi. |
| 3 | **[Alert Dashboard SPA](https://nebuflux.github.io/artifact_3)** | An Angular single-page application backed by Express and MongoDB Atlas. Serves a filterable, paginated alert table via a MongoDB aggregation pipeline, with `httpOnly` JWT cookie auth for the dashboard and a bearer-secret path for Pi ingestion. |

## Code Review

A recorded walkthrough of the original artifacts and the design rationale behind each enhancement is available on YouTube: **[CS499 Capstone Code Review](https://www.youtube.com/watch?v=-Z_eqNcygFk)**.

---

## Tech Stack

- **Portfolio site:** Next.js, TypeScript, Tailwind CSS, Shiki
- **Artifact 1:** Python, Scapy, TensorFlow Lite, `python-statemachine`, Raspberry Pi OS
- **Artifact 2:** TensorFlow/Keras, Scikit-Learn, SMOTE (`imbalanced-learn`), Jupyter
- **Artifact 3:** Node.js, Express, MongoDB Atlas, Mongoose, Passport.js, Angular, Angular Material


The site is statically exported and deployed to GitHub Pages from the `main` branch.

---

## Contact

- GitHub: **[@NebuFlux](https://github.com/NebuFlux)**
