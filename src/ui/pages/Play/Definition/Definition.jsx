import { Value } from "./Definition.styles";

export const Definition = ({ definitions }) => {
  return (
    <>
      {definitions.map(({ class: class_, value, exp }, i) => (
        <Value key={i}>{`${class_}. ${value}`}</Value>
      ))}
    </>
  );
};

