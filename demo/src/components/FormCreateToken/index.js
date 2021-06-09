import React, { useState } from "react";

const FormCreateToken = (props) => {
  const [precision, setPrecision] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [description, setDescription] = useState("");
  const [symbol, setSymbol] = useState("");
  const [receiver, setReceiver] = useState("");

  const handleCreateToken = async (event) => {
    event.preventDefault();

    await await window.ConnectionsController.handleCreateToken(
      Number(precision),
      symbol,
      Number(maxSupply),
      description,
      receiver
    );

    event.target.reset();
  };

  return (
    <form onSubmit={handleCreateToken}>
      <div className="property">
        <h2>You are creating {props.token}</h2>

        <div>
          <label htmlFor="precision">Precision:</label>
          <input
            className="input"
            type="number"
            id="precision"
            name="precision"
            onBlur={(event) => setPrecision(event.target.value)}
            required
          />

          <label htmlFor="maxSupply">Max. Supply:</label>
          <input
            className="input"
            type="number"
            id="maxSupply"
            name="maxSupply"
            onBlur={(event) => setMaxSupply(event.target.value)}
            required
          />

          <label htmlFor="description">Description</label>
          <input
            className="input"
            type="text"
            id="description"
            name="description"
            onBlur={(event) => setDescription(event.target.value)}
            required
          />

          <label htmlFor="symbol">Symbol:</label>
          <input
            className="input"
            type="text"
            id="symbol"
            name="symbol"
            onBlur={(event) => setSymbol(event.target.value)}
            required
          />

          <label htmlFor="receiver">Sys address:</label>
          <input
            className="input"
            type="text"
            id="receiver"
            name="receiver"
            onBlur={(event) => setReceiver(event.target.value)}
            required
          />
        </div>

        <button
          className="button"
          type="submit"
          disabled={
            !precision || !maxSupply || !description || !symbol || !receiver
          }
        >
          Create
        </button>
      </div>
    </form>
  );
};

export default FormCreateToken;
