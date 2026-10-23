import React from "react";

const topics = [
  ["Account access", "Signup, login, and password recovery"],
  ["Mobile verification", "SMS verification setup and troubleshooting"],
  ["Watchlists", "Managing your saved instruments"],
  ["Practice orders", "Simulated order functionality and limitations"],
];

function CreateTicket() {
  return (
    <section className="container pb-5">
      <div className="row g-3">
        {topics.map(([title, description]) => (
          <article className="col-md-6" key={title}>
            <div className="bg-white border rounded-4 p-4 h-100">
              <h2 className="h5">{title}</h2>
              <p className="text-secondary mb-0">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CreateTicket;
