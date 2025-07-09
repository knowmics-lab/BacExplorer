import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";

export default function FolderSel({ formData, setFormData }) {
  const [error, setError] = useState("");

  useEffect(() => {
    const folderButton = document.getElementById("FolderSel");
    if (folderButton) {
      folderButton.addEventListener("click", async () => {
        const folderPath = await window.api.selectFolder();
        if (folderPath) {
          setFormData((prevData) => ({
            ...prevData,
            INPUT: folderPath[0] || "",
          }));
          setError("");
        }
      });
    }

    return () => {
      if (folderButton) {
        folderButton.removeEventListener("click", async () => {
          const folderPath = await window.api.selectFolder();
          if (folderPath) {
            setFormData((prevData) => ({
              ...prevData,
              INPUT: folderPath[0] || "",
            }));
          }
        });
      }
    };
  }, [setFormData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.INPUT) {
      setError("Please select a folder.");
    } else {
      setError("");
      alert(`Folder selected: ${formData.INPUT}`);
    }
  };

  return (
      <div>
        <h1 className="text-header">Select Input Folder</h1>
        <Button id="FolderSel" variant="light">
          Select Input Folder
        </Button>
        <p id="selected-folder">{formData.INPUT || "No folder selected"}</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
  );
}
