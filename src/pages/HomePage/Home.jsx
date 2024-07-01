import React, { useState, useRef } from 'react';
import CanvasDraw from 'react-canvas-draw';
import jsPDF from 'jspdf';
import './Home.css';

function Home() {
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawings, setDrawings] = useState({});
  const [audioFiles, setAudioFiles] = useState({});
  const [fullscreenBgColor, setFullscreenBgColor] = useState('bg-white'); // State for fullscreen background color
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [selectedAudioFile, setSelectedAudioFile] = useState(null);
  const bookRef = useRef(null);
  const canvasRefs = useRef([]);

  const pages = [
    "Cover: Welcome to the book! ",
    "Page 1: This is the first page of the book.",
    "Page 2: This is the second page of the book.",
    "Page 3: This is the third page of the book.",
    "Page 4: This is the fourth page of the book.",
    "Page 5: This is the fifth page of the book.",
  ];

  // Ensure canvasRefs are initialized for each page
  if (canvasRefs.current.length !== pages.length) {
    canvasRefs.current = Array(pages.length).fill().map((_, i) => canvasRefs.current[i] || React.createRef());
  }

  const nextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 2, pages.length - 1));
  };

  const prevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 2, 0));
  };

  const zoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2));
  };

  const zoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (bookRef.current.requestFullscreen) {
        bookRef.current.requestFullscreen();
      } else if (bookRef.current.mozRequestFullScreen) {
        bookRef.current.mozRequestFullScreen();
      } else if (bookRef.current.webkitRequestFullscreen) {
        bookRef.current.webkitRequestFullscreen();
      } else if (bookRef.current.msRequestFullscreen) {
        bookRef.current.msRequestFullscreen();
      }
      setFullscreenBgColor('bg-white'); // Set background color to white when entering fullscreen
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setFullscreenBgColor(''); // Reset background color when exiting fullscreen
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleDrawing = () => {
    setIsDrawing(!isDrawing);
  };

  const saveDrawing = () => {
    const savedDrawing = canvasRefs.current[page].current.getSaveData();
    setDrawings((prevDrawings) => ({ ...prevDrawings, [page]: savedDrawing }));
    setIsDrawing(false);
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedAudioFile(URL.createObjectURL(file));
    }
  };

  const saveAudio = () => {
    setAudioFiles((prevAudioFiles) => ({
      ...prevAudioFiles,
      [page]: selectedAudioFile,
    }));
    setSelectedAudioFile(null);
    setIsAudioModalOpen(false);
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    pages.forEach((text, index) => {
      doc.text(text, 10, 10);
      if (drawings[index]) {
        const imgData = canvasRefs.current[index].current.canvas.drawing.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, 20, 180, 160);
      }
      if (audioFiles[index]) {
        doc.text("Audio File Attached", 10, 190);
      }
      if (index < pages.length - 1) {
        doc.addPage();
      }
    });
    doc.save('book_with_notes_and_audio.pdf');
  };

  return (
    <div className="App">
      <div ref={bookRef} className={`book ${fullscreenBgColor}`} style={{ transform: `scale(${zoom})` }}>
        {page === 0 ? (
          <div className="book-page single">
            {pages[page]}
            {drawings[page] && (
              <CanvasDraw
                disabled={!isDrawing}
                hideInterface
                immediateLoading
                grid={false}
                saveData={drawings[page]}
                ref={canvasRefs.current[page]}
              />
            )}
            {!drawings[page] && isDrawing && <CanvasDraw ref={canvasRefs.current[page]} />}
            {audioFiles[page] && (
              <audio controls>
                <source src={audioFiles[page]} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        ) : (
          <>
            <div className="book-page">
              {pages[page]}
              {drawings[page] && (
                <CanvasDraw
                  disabled={!isDrawing}
                  hideInterface
                  immediateLoading
                  saveData={drawings[page]}
                  ref={canvasRefs.current[page]}
                  grid={false}
                />
              )}
              {!drawings[page] && isDrawing && <CanvasDraw ref={canvasRefs.current[page]} />}
              {audioFiles[page] && (
                <audio controls>
                  <source src={audioFiles[page]} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
            {page + 1 < pages.length && (
              <div className="book-page">
                {pages[page + 1]}
                {drawings[page + 1] && (
                  <CanvasDraw
                    disabled={!isDrawing}
                    hideInterface
                    immediateLoading
                    saveData={drawings[page + 1]}
                    ref={canvasRefs.current[page + 1]}
                    grid={false}
                  />
                )}
                {!drawings[page + 1] && isDrawing && <CanvasDraw ref={canvasRefs.current[page + 1]} />}
                {audioFiles[page + 1] && (
                  <audio controls>
                    <source src={audioFiles[page + 1]} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            )}
          </>
        )}
        {isFullscreen && (
          <button onClick={toggleFullscreen} className="exit-fullscreen-button">
            Exit Fullscreen
          </button>
        )}
      </div>
      <div className="buttons">
        <button onClick={prevPage} disabled={page === 0}>Previous</button>
        <button onClick={nextPage} disabled={page >= pages.length - 1}>Next</button>
      </div>
      <button onClick={toggleModal} className="accessibility-button">Accessibility</button>
      <button onClick={toggleFullscreen} className="fullscreen-button">
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>
      <button onClick={toggleDrawing} className="note-button">Add Note</button>
      {isDrawing && <button onClick={saveDrawing} className="save-button">Save Note</button>}
      <button onClick={() => setIsAudioModalOpen(true)} className="audio-button">Audio</button>
      <button onClick={downloadAsPDF} className="download-button">Download as PDF</button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={zoomIn}>Zoom In</button>
            <button onClick={zoomOut}>Zoom Out</button>
            <button onClick={toggleModal}>Close</button>
          </div>
        </div>
      )}

      {isAudioModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <input type="file" accept="audio/*" onChange={handleAudioUpload}
            />
            <button onClick={saveAudio} disabled={!selectedAudioFile}>Save Audio</button>
            <button onClick={() => setIsAudioModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
