'use strict';

//fs(FileSystem)：ファイルを扱うモジュールの呼び出し
//readlineはファイルを一行ずつ読み込むためのモジュール
const fs = require('fs');
const readline = require('readline');

//popu-pref.csvからファイルの読み込みを行うStreamを生成
//読み込んだrsをreadlineオブジェクトのinputとして設定してrlオブジェクトを作成
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });

//集計されたデータをッカウ能する連想配列
//key:都道府県、value:集計データのオブジェクト
const prefectureDataMap = new Map();

//rlオブジェクトでlineというイベントが発生したらこの関数が呼び出される
//lineStringにはcsvから読み込んだ1行の文字列が入っている
rl.on('line', (lineString) => {

  //カンマ区切りで分割して配列に格納
  //この関数は文字列を対象とした関数→関数の結果も文字列の配列
  const columns = lineString.split(',');

  //parseInt()で文字列を整数値に変換
  const year = parseInt(columns[0]);
  const pref = columns[1];
  const popu = parseInt(columns[3]);
  
  //集計年が2010と2015年のデータから集計年・都道府県・15~19歳の人口を抜き出す
  if ( year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(pref);

    //valueがFalsyの場合、初期値を代入
    if ( !value ) {
      value = {
        popu10: 0, //2010年の人口
        popu15: 0, //2015年の人口
        change: null //人口の変化率
      };
    }

      if ( year === 2010) {
        value.popu10 = popu;
      } else if ( year === 2015 ){
        value.popu15 = popu;
      }

      prefectureDataMap.set(pref, value);
  }
});

//'close'イベントは全ての行を読み込み終わったあとに呼び出される。
rl.on ('close', () => {
  //for-of構文:prefectureDataMap(Map)のキーと値をforループで変数に代入していってる
  //変化率の計算
  for ( let [key, value] of prefectureDataMap ) {
    value.change = value.popu15 / value.popu10;
  }

  //Array.from (prefectureDataMap)で連想配列を普通の配列に変換
  //(pair1, pair2)は比較関数←並びかえをするルールを決めることができる
  const rankingArray = Array.from (prefectureDataMap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });

  //map関数:Arrayのそれぞれの要素を与えられた関数を適用した内容に変換する
  const rankingStrings = rankingArray.map(([key, value]) => {
    return key + ': ' + value.popu10 + ' => ' + value.popu15 + ' 変化率:' + value.change;
  });

  console.log(rankingStrings);
});