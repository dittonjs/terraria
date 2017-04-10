class GameSounds extends GameObject {
  constructor(soundFiles, format, source, ...args){
    super(...args);
    this.soundFiles = soundFiles;
    this.sounds = {};
    this.source = source;
    this.format = format;
    this._initializeSounds();
  }
  _initializeSounds(){
    _.each(this.soundFiles, (fileName) => {
      let sound = new Audio();
      sound.src = `${this.source}/${fileName}.${this.format}`;
      this.sounds[fileName] = sound;
    });
  }
}
