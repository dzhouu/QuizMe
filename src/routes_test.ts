import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import {load, save, saveScore, resetFilesForTesting, lists, listScores, clear, clearScores} from './routes';


describe('routes', function() {



  it('save', function() {
    // Test case 1: Successful save of a new flashcard set
    const req1 = httpMocks.createRequest({
      method: 'POST',
      url: '/save',
      body: { name: 'Set1', value: 'Question1|Answer1\nQuestion2|Answer2' }
    });
    const res1 = httpMocks.createResponse();
    save(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), { check: false });

    // Test case 2: Missing name parameter
    const req2 = httpMocks.createRequest({
      method: 'POST',
      url: '/save',
      body: { value: 'Question1|Answer1\nQuestion2|Answer2' }
    });

    const res2 = httpMocks.createResponse();
    save(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(), 'required argument "name" was missing');

    // Test case 3: Missing value parameter
    const req3 = httpMocks.createRequest({
      method: 'POST',
      url: '/save',
      body: { name: 'Set2' }
    });
    const res3 = httpMocks.createResponse();
    save(req3, res3);
    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(), 'required argument "text" was missing');

    // Test case 4: Incorrect value parameter type
    const req4 = httpMocks.createRequest({
      method: 'POST',
      url: '/save',
      body: { name: 'Set3', value: 123 } // Should be a string
    });
    const res4 = httpMocks.createResponse();
    save(req4, res4);
    assert.strictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(res4._getData(), 'required argument "text" is not a string');

    // Test case 5: Attempt to save with an existing name
    const req5 = httpMocks.createRequest({
      method: 'POST',
      url: '/save',
      body: { name: 'Set1', value: 'NewQuestion|NewAnswer' }
    });
    const res5 = httpMocks.createResponse();
    save(req5, res5);
    assert.strictEqual(res5._getStatusCode(), 400);
    assert.deepStrictEqual(res5._getData(), 'Name of the Set Already Exists');
    resetFilesForTesting();

    // Test Case 6: Terrible Value Input
    const req6 = httpMocks.createRequest({
      method: 'POST',
      url: '/save',
      body: { name: 'Set1', value: 'NewQuestion NewAnswer' } // Doesn't have "|"
    });
    const res6 = httpMocks.createResponse();
    save(req6, res6);
    assert.strictEqual(res6._getStatusCode(), 400);
    assert.deepStrictEqual(res6._getData(), 'Must have a question/answer or must have a "|" separating front and back');
    resetFilesForTesting();

    const req7 = httpMocks.createRequest({
      method: 'POST',
      url: '/save',
      body: { name: 'Set1', value: 'NewQuestion|' } // Missing Back
    });
    const res7 = httpMocks.createResponse();
    save(req7, res7);
    assert.strictEqual(res7._getStatusCode(), 400);
    assert.deepStrictEqual(res7._getData(), 'Must have a question/answer or must have a "|" separating front and back');

    resetFilesForTesting();
  });

  it('lists', function () {
    // Test case 1: List flashcard set names when sets are present
    const saveReq1 = httpMocks.createRequest({
      method: 'POST',
      url: '/save',
      body: { name: 'Set1', value: 'Q1|A1' }
    });
    const saveRes1 = httpMocks.createResponse();
    save(saveReq1, saveRes1);

    const listsReq1 = httpMocks.createRequest({
      method: 'GET',
      url: '/lists'
    });
    const listsRes1 = httpMocks.createResponse();
    lists(listsReq1, listsRes1);

    assert.strictEqual(listsRes1._getStatusCode(), 200);
    assert.deepStrictEqual(listsRes1._getData(), { sets: ['Set1'] });
    resetFilesForTesting();

  });

  it('load', function() {
    // Test case 1: Successfully load an existing flashcard set
    const saveReq1 = httpMocks.createRequest({
      method: 'POST',
      url: '/save',
      body: { name: 'Set1', value: 'Q1|A1\nQ2|A2' }
    });
    const saveRes1 = httpMocks.createResponse();
    save(saveReq1, saveRes1);

    const loadReq1 = httpMocks.createRequest({
      method: 'GET',
      url: '/load',
      query: { name: 'Set1' }
    });
    const loadRes1 = httpMocks.createResponse();
    load(loadReq1, loadRes1);

    const expectedContent1 = [
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' }
    ];

    assert.strictEqual(loadRes1._getStatusCode(), 200);
    assert.deepStrictEqual(loadRes1._getData(), { name: 'Set1', content: expectedContent1 });
    resetFilesForTesting();

    // Test case 2: Attempt to load a non-existing flashcard set
    const loadReq2 = httpMocks.createRequest({
      method: 'GET',
      url: '/load',
      query: { name: 'NonExistingSet' }
    });
    const loadRes2 = httpMocks.createResponse();
    load(loadReq2, loadRes2);
    assert.strictEqual(loadRes2._getStatusCode(), 404);
    assert.deepStrictEqual(loadRes2._getData(), 'No file under the name NonExistingSet');
    resetFilesForTesting();

    // Test case 3: Missing name parameter
    const loadReq3 = httpMocks.createRequest({
      method: 'GET',
      url: '/load',
      query: {} // Missing 'name' parameter
    });
    const loadRes3 = httpMocks.createResponse();
    load(loadReq3, loadRes3);
    assert.strictEqual(loadRes3._getStatusCode(), 400);
    assert.deepStrictEqual(loadRes3._getData(), 'required argument "name" was missing');
    resetFilesForTesting();
  });

  it('saveScore', function() {
    // Test case 1: Successful save of a score
    const req1 = httpMocks.createRequest({
      method: 'POST',
      url: '/saveScore',
      body: { username: 'user1', setName: 'Set1', percent: '80' }
    });
    const res1 = httpMocks.createResponse();
    saveScore(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), { savedscore: true });
    resetFilesForTesting();

    // Test case 2: Missing username parameter
    const req2 = httpMocks.createRequest({
      method: 'POST',
      url: '/saveScore',
      body: { setName: 'Set1', percent: '80' }
    });
    const res2 = httpMocks.createResponse();
    saveScore(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(), 'missing \'username\' parameter');
    resetFilesForTesting();

    // Test case 3: Missing setName parameter
    const req3 = httpMocks.createRequest({
      method: 'POST',
      url: '/saveScore',
      body: { username: 'user1', percent: '80' }
    });
    const res3 = httpMocks.createResponse();
    saveScore(req3, res3);
    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(), 'missing \'setName\' parameter');
    resetFilesForTesting();

    // Test case 4: Missing percent parameter
    const req4 = httpMocks.createRequest({
      method: 'POST',
      url: '/saveScore',
      body: { username: 'user1', setName: 'Set1' }
    });
    const res4 = httpMocks.createResponse();
    saveScore(req4, res4);
    assert.strictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(res4._getData(), 'missing \'percent\' parameter');
    resetFilesForTesting();
  });

  it('listScores', function () {
    // Test case 1: List scores when scores are present
    const saveScoreReq1 = httpMocks.createRequest({
      method: 'POST',
      url: '/saveScore',
      body: { username: 'user1', setName: 'Set1', percent: '80' }
    });
    const saveScoreRes1 = httpMocks.createResponse();
    saveScore(saveScoreReq1, saveScoreRes1);

    const listScoresReq1 = httpMocks.createRequest({
      method: 'GET',
      url: '/listScores'
    });
    const listScoresRes1 = httpMocks.createResponse();
    listScores(listScoresReq1, listScoresRes1);

    assert.strictEqual(listScoresRes1._getStatusCode(), 200);
    assert.deepStrictEqual(listScoresRes1._getData(), { scores: [{ username: 'user1', setName: 'Set1', percent: '80' }] });
    resetFilesForTesting();
  });

  it('clear', function() {
    // Test case 1: Successfully clear flashcard sets
    const saveReq1 = httpMocks.createRequest({
      method: 'POST',
      url: '/save',
      body: { name: 'Set1', value: 'Q1|A1' }
    });
    const saveRes1 = httpMocks.createResponse();
    save(saveReq1, saveRes1);

    const clearReq1 = httpMocks.createRequest({
      method: 'GET',
      url: '/clear'
    });
    const clearRes1 = httpMocks.createResponse();
    clear(clearReq1, clearRes1);

    const listsReq1 = httpMocks.createRequest({
      method: 'GET',
      url: '/lists'
    });
    const listsRes1 = httpMocks.createResponse();
    lists(listsReq1, listsRes1);

    assert.strictEqual(listsRes1._getStatusCode(), 200);
    assert.deepStrictEqual(listsRes1._getData(), { sets: [] });
    resetFilesForTesting();

    // Test case 2: Clear flashcard sets when no sets are present
    const clearReq2 = httpMocks.createRequest({
      method: 'GET',
      url: '/clear'
    });
    const clearRes2 = httpMocks.createResponse();
    clear(clearReq2, clearRes2);

    const listsReq2 = httpMocks.createRequest({
      method: 'GET',
      url: '/lists'
    });
    const listsRes2 = httpMocks.createResponse();
    lists(listsReq2, listsRes2);

    assert.strictEqual(listsRes2._getStatusCode(), 200);
    assert.deepStrictEqual(listsRes2._getData(), { sets: [] });
    resetFilesForTesting();
  });

  it('clearScores', function() {
    // Test case 1: Successfully clear scores
    const saveScoreReq1 = httpMocks.createRequest({
      method: 'POST',
      url: '/saveScore',
      body: { username: 'user1', setName: 'Set1', percent: '80' }
    });
    const saveScoreRes1 = httpMocks.createResponse();
    saveScore(saveScoreReq1, saveScoreRes1);

    const clearScoresReq1 = httpMocks.createRequest({
      method: 'GET',
      url: '/clearScores'
    });
    const clearScoresRes1 = httpMocks.createResponse();
    clearScores(clearScoresReq1, clearScoresRes1);

    const listScoresReq1 = httpMocks.createRequest({
      method: 'GET',
      url: '/listScores'
    });
    const listScoresRes1 = httpMocks.createResponse();
    listScores(listScoresReq1, listScoresRes1);

    assert.strictEqual(listScoresRes1._getStatusCode(), 200);
    assert.deepStrictEqual(listScoresRes1._getData(), { scores: [] });
    resetFilesForTesting();

    // Test case 2: Clear scores when no scores are present
    const clearScoresReq2 = httpMocks.createRequest({
      method: 'GET',
      url: '/clearScores'
    });
    const clearScoresRes2 = httpMocks.createResponse();
    clearScores(clearScoresReq2, clearScoresRes2);

    const listScoresReq2 = httpMocks.createRequest({
      method: 'GET',
      url: '/listScores'
    });
    const listScoresRes2 = httpMocks.createResponse();
    listScores(listScoresReq2, listScoresRes2);

    assert.strictEqual(listScoresRes2._getStatusCode(), 200);
    assert.deepStrictEqual(listScoresRes2._getData(), { scores: [] });
    resetFilesForTesting();
  });
});
