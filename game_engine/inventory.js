class Inventory {
  constructor(existing = {}){
    this.inventory = {};
    _.merge(this.inventory, existing);
  }
  addItem(itemName, count){

    this.inventory[itemName] ? (this.inventory[itemName] += count) : (this.inventory[itemName] = count);
  }
  removeItem(itemName, count){
    if(this.inventory[itemName])
    this.inventory[itemName] -= count;
    this.inventory[itemName] < 0 && (this.inventory[itemName] = 0);
  }
}
