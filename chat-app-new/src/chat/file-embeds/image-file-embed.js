import { useEffect, useRef, useState } from "react";

export default function ImageFileEmbed(props) {
  // Reference to the image DOM element
  const image = useRef(null);
  const [imageStyle, setImageStyle] = useState({ width: "100%", height: "auto" });

useEffect(() => {
    const handleResize = () => {
      if (image.current) {
        // Check if fullscreen class is present
        if (props.className && props.className.includes('fullscreen')) {
          const winWidth = window.innerWidth;
          const winHeight = window.innerHeight;
          const winAspectRatio = winWidth / winHeight;

          const imgWidth = image.current.naturalWidth;
          const imgHeight = image.current.naturalHeight;
          const imgAspectRatio = imgWidth / imgHeight;

          if (imgAspectRatio <= winAspectRatio) {
            setImageStyle({ height: "90vh", width: "auto" });
          } else {
            setImageStyle({ height: "auto", width: "90%" });
          }
        } else {
          setImageStyle({ width: "100%", height: "auto" });
        }
      }
    };

    // Calculate on initial render
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [props.className]); // Add props.className as a dependency

  return (
    <>
      <p className="file-msg-p"> {props.file.fileName}</p>
      <img
        ref={image}
        className="file-embed image-file-embed"
        style={imageStyle}
        src={props.file.dataURI}
        alt={props.file.fileName}
      />
    </>
  );
}
