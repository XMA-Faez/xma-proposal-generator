import React from "react";

function Button({ children }) {
  return (
    <button className="button--calypso inline-block relative bg-fg px-6 py-2 text-black">
      <span>{children}</span>
    </button>
  );
}

export default Button;
