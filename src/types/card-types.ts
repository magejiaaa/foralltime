export interface CardType {
  title: string;
  item: Array<ItemType>;
  activityId: Array<string>;
}

export type ItemType = {
  name: string;
  image: string;
}