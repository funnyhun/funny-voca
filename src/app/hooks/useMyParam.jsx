import { replace, useNavigate, useParams } from "react-router-dom";

const useMyParam = (key, path) => {
  const navigate = useNavigate();
  const params = useParams();
  const param = Math.max(0, Math.floor(Number(params[key])) || 0);

  const navBasedParam = (newParam) => {
    if (newParam < 0) newParam = 0;

    navigate(`${path}${newParam}`, { relative: "path" });
  };

  return {
    param,
    navBasedParam,
  };
};

const useStep = () => {
  const { param: step, navBasedParam: changeStep } = useMyParam("step", "../");
  return { step, changeStep };
};

export { useStep };
