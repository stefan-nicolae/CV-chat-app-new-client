import React from 'react';

function isValidURL(string) {
  var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null);
}

export default function TextMessage(props) {
  const className = `message text-message ${props.me ? "me" : "them"} ${props.isClosed ? "msgClosed" : ""}`;

  const words = props.message.split(" ");

  const elements = words.map((word, index) => {
    if (isValidURL(word)) {
      let url = word;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "http://" + url;
      }
      return <a key={index} href={url} target="_blank" rel="noopener noreferrer">{word} </a>;
    } else {
      return <span key={index}>{word} </span>;
    }
  });

  return (
    <div className={className}>
      {elements}
    </div>
  );
}
