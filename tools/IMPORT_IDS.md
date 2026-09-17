# 627 IDs の取り込み

## 安全な方法

GitHub Actions からログイン済みmomonマイリストを直接読むことはしません。Safariの現在のページからIDだけを抽出し、ユーザーが確認してからGitHubへ渡します。

1. Safariで `https://momon-ga.com/mylist/` を開き、ログイン状態を確認。
2. Safariショートカットで `tools/momon-id-exporter.js` の内容を「WebページでJavaScriptを実行」に入れて実行。
3. 結果の先頭に `COUNT=627` が出ることを確認。
4. `mo...` の行だけを `data/ids.txt` に保存。
5. GitHub Actions `Extract momon authors` を実行。

## 重要

- これはページのDOM/HTMLに現在存在するIDを抽出する方式です。
- ページが遅延読み込みで一部しか表示していない場合、627未満になります。その場合はIDを確定済みと扱いません。
- GitHubへ渡すのは作品IDだけです。ログインCookieは渡しません。
- 作者名は公開作品ページの明示的な `【作者】` 欄だけを採用します。推測で補完しません。
