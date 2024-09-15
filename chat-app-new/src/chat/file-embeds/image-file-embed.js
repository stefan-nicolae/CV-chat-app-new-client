import { useEffect, useRef } from "react";

export default function ImageFileEmbed(props) {
  // Reference to the image DOM element
  const image = useRef(null);
console.log(props.className)

useEffect(() => {
    const handleResize = () => {
      if (image.current) {
        // Check if fullscreen class is present
        if (props.className && props.className.includes('fullscreen')) {
          console.log('resizing fullscreen');
          const winWidth = window.innerWidth;
          const winHeight = window.innerHeight;
          const winAspectRatio = winWidth / winHeight;

          const imgWidth = image.current.naturalWidth;
          const imgHeight = image.current.naturalHeight;
          const imgAspectRatio = imgWidth / imgHeight;

          if (imgAspectRatio <= winAspectRatio) {
            // Image height = 90vh (90% of the viewport height)
            image.current.style.height = '90vh';
            image.current.style.width = 'auto'; // Maintain aspect ratio
          } else {
            // Image width = 90% (height will adjust automatically)
            image.current.style.height = 'auto'; // Maintain aspect ratio
            image.current.style.width = '90%';
          }
        } else {
          // Handle non-fullscreen case
          image.current.style.width = '100%';
          image.current.style.height = 'auto';
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
        src={props.file.dataURI}
        alt={props.file.fileName}
        onLoad={() => {
          // Recalculate on image load
        //   const imgWidth = image.current.naturalWidth;
        //   const imgHeight = image.current.naturalHeight;
        //   console.log("Image loaded:", imgWidth, imgHeight);
        }}
      />
    </>
  );
}
