export interface CardType {
  title: string;
  item: Array<ItemType>;
  activityId: string;
}

export type ItemType = {
  name: string;
  image: string;
}