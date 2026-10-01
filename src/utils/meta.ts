import { getConfig } from "../lib/db";

export const getWeddingMeta = () => {
  const config = getConfig();
  const bride =
    config.BRIDE_NICKNAME || config.BRIDE_FULLNAME || "Mempelai Wanita";
  const groom =
    config.GROOM_NICKNAME || config.GROOM_FULLNAME || "Mempelai Pria";
  const fullBride = config.BRIDE_FULLNAME || bride;
  const fullGroom = config.GROOM_FULLNAME || groom;
  const title = `The Wedding of ${bride} & ${groom}`;
  const shortName = `${bride} & ${groom}`;
  const description = `Undangan Pernikahan Digital ${fullBride} & ${fullGroom}`;
  const image = config.HERO_IMAGE || "/thumbnail.png";

  return { title, shortName, description, image };
};
