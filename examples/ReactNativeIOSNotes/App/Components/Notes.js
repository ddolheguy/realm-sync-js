var React = require('react-native');
var SingleNote = require('./SingleNote');
var FBAccount = require('./FBAccount');


import Realm from '../Utils/realm';
let realmSync = Realm.realmSync;
let realm = realmSync.getRealmInstance();

var {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableHighlight
} = React;

import { ListView } from 'realm/react-native';

class Notes extends React.Component{

  constructor() {
    super();
    console.log(realm.path);
    let note = realm.objects('Note');
    var notesArray = note.slice().reverse();
    this.ds = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });
    this.state = {
      dataSource: this.ds.cloneWithRows(notesArray),
      note: '',
      error: ''
    }

    realm.addListener('change', () => {
      var notesArray = note.slice().reverse();
      this.setState({
        dataSource: this.ds.cloneWithRows(notesArray)
      })
    });
  }

  handleChange(e) {
    this.setState({
      note: e.nativeEvent.text
    })
  }
  handleSubmit() {
    var note = this.state.note;
    this.setState({
      note: ''
    })
    realm.write(() => {
      realmSync.create('Note', {name: note});
      realmSync.sync((err, res) => {
        console.log("Error: ", err);
        console.log("Result: ", res);
      })
    })
  }
  syncRemoteDB() {
    // console.log('Inside Remote DB Sync Method');
    realmSync.sync((err, res) => {
      console.log("Error: ", err);
      console.log("Result: ", res);
    })
  }

  renderRow(rowData) {
    rowData = rowData;


    return(
      <SingleNote rowData={rowData} realm={realm} realmSync={realmSync} />

    )
  }
  footer() {
    return(
      <View style={styles.footerContainer}>
        <TextInput
          style={styles.newNoteInput}
          value={this.state.note}
          onChange={this.handleChange.bind(this)}
          placeholder="New Note" />
        <TouchableHighlight
          style={styles.button}
          onPress={this.handleSubmit.bind(this)}
          underlayColor="red">
          <Text style={styles.buttonText}> Submit </Text>
        </TouchableHighlight>
      </View>
    )
  }
  render() {
    // console.log(realm.path)

    return(
      <View style={styles.container}>
        <TouchableHighlight
        style={styles.syncBar}
        onPress={this.syncRemoteDB.bind(this)}
        underlayColor="red">
          <Text style={styles.syncBarText}>Sync Notes</Text>
        </TouchableHighlight>

        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          automaticallyAdjustContentInsets={false} />
        {this.footer()}
      </View>
    )
  }
};


var styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#503f59'
  },
  syncBarText: {
    fontSize: 20,
    color: 'white'
  },
  syncBar: {
    padding: 10,
    marginTop: 45,
    marginBottom: 10,
    backgroundColor: '#928699',
    borderRadius: 6,
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 20,
    color: 'black'
  },
  button: {
    height: 60,
    backgroundColor: '#c1dfb5',
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6
  },
  newNoteInput: {
    height: 60,
    padding: 10,
    fontSize: 18,
    color: '#111',
    flex: 10
  },
  footerContainer: {
    backgroundColor: 'white',
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 6
  }
});


module.exports = Notes;
