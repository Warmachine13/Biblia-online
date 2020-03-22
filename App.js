import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Button, TextInput, AsyncStorage } from 'react-native';
import {
  AdMobBanner,
  AdMobInterstitial
} from 'react-native-admob'

Text.defaultProps = {
  style: { fontSize: 18, color: 'white' },
}

const Capitulos = React.memo(({ item, _capitulos, ...props }) => {
  let { abbrev, author, chapters, group, name, testament } = item.item;
  // Proxima pagina utiliza o abbrev

  return (
    <View key={item.index} style={{ backgroundColor: 'black', width: '100%', padding: 5, borderBottomColor: 'lightgray', borderBottomWidth: 0.5 }}>
      <TouchableOpacity onPress={_ => _capitulos(abbrev, 1)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <Text>Autor: {author}</Text>
          <Text>Quantidade de capitulos: {chapters}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <Text>Nome: {name}</Text>
          <Text>Grupo: {group}</Text>
        </View>
        <Text>Testamento: {testament}</Text>
      </TouchableOpacity>
    </View>
  )
})


const Verses = React.memo(({ item }) => {
  let { number, text } = item;
  // Proxima pagina utiliza o abbrev
  return (
    <View style={{ backgroundColor: 'black', width: '100%', padding: 5, borderBottomColor: 'lightgray', borderBottomWidth: 0.5 }}>
      <View style={{ justifyContent: 'space-between', width: '100%' }}>
        <Text> <Text style={{ fontSize: 20 }}> {number}</Text>{text}</Text>
      </View>
    </View>
  )
})

const ListaVersiculos = React.memo(({ item }) => {
  let { number, text, book, chapter } = item.item;
  return (
    <View style={{ backgroundColor: 'black', width: '100%', padding: 5, borderBottomColor: 'lightgray', borderBottomWidth: 0.5 }}>
      <View style={{ justifyContent: 'space-between', width: '100%' }}>
        <Text>Capitulo {chapter}</Text>
        <Text>Livro {book}</Text>
        <Text><Text style={{ fontSize: 22 }}>{number} </Text>{text}</Text>
      </View>
    </View>
  )
})



export default _ => {
  let [livros, setLivros] = useState([]);
  let [capitulo, setCapitulos] = useState(null);
  let [versiculos, setVersiculos] = useState(null);

  let showAd = () => AdMobInterstitial.requestAd().then(() =>
    AdMobInterstitial.showAd()
  );

  useEffect(async _ => {
    AdMobInterstitial.setAdUnitID('ca-app-pub-3408462666302033/8937762302');

    try {
      let response = await fetch('https://bibleapi.co/api/books/');
      let responseJson = await response.json();
      setLivros(responseJson)
      await AsyncStorage.setItem('versiculos', JSON.stringify(responseJson))
    } catch (error) {
      let versiculos = await AsyncStorage.getItem('versiculos')

      if (versiculos)
        setLivros(JSON.parse(versiculos));
    }
    showAd();
  }, [])



  let _capitulos = async (abbrev, cap) => {
    showAd();
    try {
      let response = await fetch(`https://bibleapi.co/api/verses/nvi/${abbrev.pt}/${cap}`);
      let responseJson = await response.json();
      setCapitulos(responseJson)
    } catch (error) {
      alert('Atenção sem internet no momento')
    }
  }


  let _search = async (search, version = "nvi") => {
    try {
      let response = await fetch('https://bibleapi.co/api/search/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version,
          search
        }),
      });
      let responseJson = await response.json();

      if (responseJson.error == undefined || search)
        setVersiculos(responseJson)
      else
        setVersiculos(null)

    } catch (error) {
      alert('Não versiculo encontrado');
      setVersiculos(null)
    }
  }

  if (capitulo) {
    let { abbrev, name, author, group, version } = capitulo.book;
    let { number, verses } = capitulo.chapter;

    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <Text>Nome: {name}</Text>
          <Text>Author: {author}</Text>
        </View>

        <Text>Grupo: {group}</Text>
        <Text>Versão: {version}</Text>

        <FlatList data={capitulo.verses} keyExtractor={(i, ind) => `${ind}`} style={{ width: '100%' }} renderItem={item => <Verses {...item} />} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <Button title='Voltar' onPress={_ => setCapitulos(null)} />
          <Text style={{ margin: 0, fontSize: 18, color: 'white' }}>Capitulo: {number} de {verses} </Text>
          {
            number != verses &&
            <Button title='Proximo' onPress={_ => _capitulos(abbrev, number + 1)} />
          }
        </View>
        <View style={{ bottom: 0 }}>
          <AdMobBanner
            adSize="largeBanner"
            adUnitID="ca-app-pub-3408462666302033/3090291832"
            testDevices={[AdMobBanner.simulatorId]}
            onAdFailedToLoad={error => console.warn(error)}
          />

        </View>
      </View >
    )
  }

  return (
    <View style={styles.container}>
      <TextInput style={{ width: '100%', color: 'white' }} onChangeText={_search} placeholderTextColor='white' placeholder='Perquise o Versiculo' />
      {
        versiculos ?
          <FlatList
            data={versiculos.verses}
            style={{ width: '100%' }}
            keyExtractor={(i, ind) => `${ind}`}
            renderItem={item => <ListaVersiculos item={item} />} />
          :
          <FlatList
            data={livros}
            style={{ width: '100%' }}
            keyExtractor={(i, ind) => `${ind}`}
            renderItem={item => <Capitulos
              item={item}
              _capitulos={(anbv, cap) => _capitulos(anbv, cap)} />
            } />
      }
      <View style={{ bottom: 0 }}>
        <AdMobBanner
          adSize="largeBanner"
          adUnitID="ca-app-pub-3408462666302033/3090291832"
          testDevices={[AdMobBanner.simulatorId]}
          onAdFailedToLoad={error => console.warn(error)}
        />

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
