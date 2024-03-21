import React, { useEffect, useState } from "react";
import "./App.css";

type Note = {
  id: number;
  title: string;
  content: string;
  archived: boolean; // Nuevo campo para indicar si la nota está archivada
};

const App = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showArchived, setShowArchived] = useState(false); // Estado para controlar si se muestran las notas archivadas

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:7000/api/notes");
        const notes: Note[] = await response.json();
        setNotes(notes);
      } catch (e) {
        console.log(e);
      }
    };

    fetchNotes();
  }, []);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:7000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          archived: false, // Por defecto, una nota nueva no está archivada
        }),
      });

      const newNote = await response.json();
      setNotes([newNote, ...notes]);
      setTitle("");
      setContent("");
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdateNote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedNote) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:7000/api/notes/${selectedNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );

      const updatedNote = await response.json();
      const updatedNotesList = notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      );

      setNotes(updatedNotesList);
      setTitle("");
      setContent("");
      setSelectedNote(null);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedNote(null);
  };

  const deleteNote = async (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation();

    try {
      await fetch(`http://localhost:7000/api/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const updatedNotes = notes.filter((note) => note.id !== noteId);
      setNotes(updatedNotes);
    } catch (e) {
      console.log(e);
    }
  };

  const handleArchiveNote = async (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation();
    try {
      await fetch(`http://localhost:7000/api/notes/archive/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const updatedNotes = notes.map((note) =>
        note.id === noteId ? { ...note, archived: true } : note
      );
      setNotes(updatedNotes);
    } catch (e) {
      console.log(e);
    }
  };

  const handleUnarchiveNote = async (
    event: React.MouseEvent,
    noteId: number
  ) => {
    event.stopPropagation();
    try {
      await fetch(`http://localhost:7000/api/notes/unarchive/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const updatedNotes = notes.map((note) =>
        note.id === noteId ? { ...note, archived: false } : note
      );
      setNotes(updatedNotes);
    } catch (e) {
      console.log(e);
    }
  };

  // Filtrar notas según el estado de "showArchived"
  const filteredNotes = showArchived
    ? notes.filter((note) => note.archived)
    : notes;

  return (
    <div className="app-container">
      <div>
        <form
          className="note-form"
          onSubmit={(event) =>
            selectedNote ? handleUpdateNote(event) : handleAddNote(event)
          }
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Categoría"
            required
          ></input>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Contenido"
            rows={10}
            required
          ></textarea>
          {selectedNote ? (
            <div className="edit-buttons">
              <button type="submit">Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          ) : (
            <button type="submit">Añadir Nota</button>
          )}
        </form>
        <div className="archive-button">
          <button onClick={() => setShowArchived(!showArchived)}>
            Mostrar Archivados
          </button>
        </div>
      </div>
      <div className="notes-grid">
        {filteredNotes.map((note) => (
          <div className="note-item" onClick={() => handleNoteClick(note)}>
            <div className="notes-header">
              <button onClick={(event) => deleteNote(event, note.id)}>x</button>
              {note.archived ? (
                <button
                  onClick={(event) => handleUnarchiveNote(event, note.id)}
                >
                  Desarchivar
                </button>
              ) : (
                <button onClick={(event) => handleArchiveNote(event, note.id)}>
                  Archivar
                </button>
              )}
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
